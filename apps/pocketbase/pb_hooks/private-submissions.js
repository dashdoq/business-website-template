// Visitor-submitted records (bookings, sign-ups, inquiries, RSVPs) must never hand their submitters'
// contact details to the public, even when a collection was generated with a public listRule/viewRule.
const SUBMISSION_HEAD_NOUN_RE = /^(bookings?|reservations?|appointments?|signups?|subscribers?|subscriptions?|registrations?|rsvps?|inquir(y|ies)|enquir(y|ies)|leads?|contacts?|messages?|submissions?|waitlists?|applications?|orders?|requests?|guests?|attendees?|participants?|volunteers?|enrollments?|enrolments?|forms?|entries|entry|responses?|feedbacks?)$/
// Name fields are anchored to person forms so descriptive ones (`serviceName`, `roomName`) stay readable and filterable.
const CONTACT_FIELD_NAME_RE = /email|phone|mobile|whatsapp|telephone|address|birth|^(full|first|last|sur|given|family|middle|maiden|display|nick|user|guest|customer|client|contact|attendee|participant|applicant|sender|author|submitter|parent|guardian|child|student|patient)?name$/i
const DIRECT_CONTACT_FIELD_NAME_RE = /email|phone|mobile|whatsapp|telephone/i
// Whole words of a field name, so fields named in other languages are caught (`telefono`, `correo`) without
// `tel` matching `hotel`.
const DIRECT_CONTACT_FIELD_WORDS = new Set(["email", "emails", "mail", "correo", "courriel", "phone", "phones", "mobile", "whatsapp", "tel", "telephone", "telefon", "telefono", "telefone", "telefoon", "celular", "cel", "movil", "handy", "cellulare", "gsm"])
const VERSION_WORD_RE = /^v?\d+$/
const NON_CONTACT_FIELD_TYPES =["autodate", "bool", "file", "password", "relation"]
const HIDDEN_FIELDS_REPORT_FILE = "horizons_platform_hidden_fields.json"
const HIDDEN_FIELDS_LEDGER_FILE = "horizons_platform_hidden_fields_ledger.json"
const NAME_WORD_RE = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g

function nameWords(name) {
    return (name.match(NAME_WORD_RE) || []).map((word) => word.toLowerCase())
}

function holdsSubmissions(collectionName) {
    const words = nameWords(collectionName)
    // `membership_applications_v2` is still `applications`.
    while (words.length > 1 && VERSION_WORD_RE.test(words[words.length - 1])) {
        words.pop()
    }
    if (!words.length) {
        return false
    }

    return SUBMISSION_HEAD_NOUN_RE.test(words[words.length - 1]) || SUBMISSION_HEAD_NOUN_RE.test(words.join(""))
}

// Rules arrive as wrapped Go *string values, so `=== ""` never matches; null means superuser-only.
function isPublicRule(rule) {
    return rule !== null && rule !== undefined && String(rule) === ""
}

// Rules that are filter expressions (owner, admin role) are a deliberate access decision and are left alone.
function isPubliclyReadable(collection) {
    return isPublicRule(collection.listRule) || isPublicRule(collection.viewRule)
}

function isDirectContactField(field) {
    return field.type() === "email"
        || DIRECT_CONTACT_FIELD_NAME_RE.test(field.name)
        || nameWords(field.name).some((word) => DIRECT_CONTACT_FIELD_WORDS.has(word))
}

function protectedFieldNames(collection) {
    if (collection.type === "auth" || collection.system || !isPubliclyReadable(collection)) {
        return []
    }

    const candidates = collection.fields.filter((field) => !field.system && !NON_CONTACT_FIELD_TYPES.includes(field.type()))
    let contactFields
    if (holdsSubmissions(collection.name)) {
        contactFields = candidates.filter((field) => isDirectContactField(field) || CONTACT_FIELD_NAME_RE.test(field.name.replace(/[_\-\s]/g, "")))
    } else if (isPublicRule(collection.createRule)) {
        // Anyone can add records and anyone can read them: visitor submissions whatever the collection is called
        // (`reservas`, `customers`, `support_tickets`). Names stay visible, since reviews and comments show who
        // wrote them; only the ways to reach that person are hidden.
        contactFields = candidates.filter(isDirectContactField)
    } else {
        return []
    }

    // A submission-sounding name alone isn't enough: `applications` or `subscriptions` can be public catalogs whose
    // `name` is a product title. Only a way to reach the person (email, phone) marks the records as submissions.
    return contactFields.some(isDirectContactField) ? contactFields.map((field) => field.name) : []
}

// Uses PocketBase's own `hidden` flag, so it strips the fields from every non-superuser response (list, view,
// expand, realtime) and rejects filters and sorts that reach them, including through relations.
function hideContactFields(collection) {
    const fieldNames = protectedFieldNames(collection)
    const newlyHidden = fieldNames.filter((name) => !collection.fields.getByName(name).getHidden())
    fieldNames.forEach((name) => collection.fields.getByName(name).setHidden(true))

    return { isProtected: fieldNames.length > 0, newlyHidden }
}

function readJsonObject(path) {
    try {
        const value = JSON.parse(toString($os.readFile(path)))
        return value && typeof value === "object" && !Array.isArray(value) ? value : {}
    } catch (_) {
        return {}
    }
}

// Written to a temp file and renamed into place, so reload_app never reads a half-written report.
function writeJsonObject(path, value) {
    $os.writeFile(`${path}.tmp`, JSON.stringify(value), 0o644)
    $os.rename(`${path}.tmp`, path)
}

// Bookkeeping only: a failure is logged and never fails the collection save that triggered it.
function updateJsonFile(app, fileName, update) {
    const path = `${app.dataDir()}/${fileName}`
    try {
        writeJsonObject(path, update(readJsonObject(path)))
    } catch (err) {
        app.logger().error("private-submissions: failed to update " + fileName, "error", String(err))
    }
}

function withFields(fieldsByKey, key, fieldNames) {
    fieldsByKey[key] = [...new Set([...(fieldsByKey[key] || []), ...fieldNames])]
    return fieldsByKey
}

// The coding agent never sees these hooks, so it learns what the platform hid from the report: reload_app reads
// and clears it, then asks the agent to set `hidden` in its own migration so its schema matches what is live.
// The ledger outlives the report and is keyed by collection id, so a rename keeps it.
function recordHiddenFields(app, collection, fieldNames) {
    if (!fieldNames.length) {
        return
    }

    app.logger().warn(
        "Hidden by platform: public submission collection",
        "collection", collection.name,
        "fields", fieldNames.join(","),
    )
    updateJsonFile(app, HIDDEN_FIELDS_REPORT_FILE, (report) => withFields(report, collection.name, fieldNames))
    updateJsonFile(app, HIDDEN_FIELDS_LEDGER_FILE, (ledger) => withFields(ledger, collection.id, fieldNames))
}

// Once a collection is no longer public (e.g. switched to an owner rule), the people it lets in see contact fields
// again. Only fields the platform hid are released; fields the agent marked hidden itself stay hidden.
function releaseContactFields(app, collection) {
    const released = readJsonObject(`${app.dataDir()}/${HIDDEN_FIELDS_LEDGER_FILE}`)[collection.id] || []
    released.forEach((name) => collection.fields.getByName(name)?.setHidden(false))

    return released
}

function forgetReleasedFields(app, collection, fieldNames) {
    if (!fieldNames.length) {
        return
    }

    updateJsonFile(app, HIDDEN_FIELDS_LEDGER_FILE, (ledger) => {
        delete ledger[collection.id]
        return ledger
    })
}

// What the visitor sent, read from the raw request: by the time record hooks run, PocketBase has already deleted
// hidden fields from requestInfo().body.
function submittedValues(e, fieldNames) {
    const request = e.requestEvent.request
    if (String(request.header.get("Content-Type")).startsWith("application/json")) {
        return JSON.parse(toString(request.body) || "{}")
    }

    const jsonPayload = request.formValue("@jsonPayload")
    const values = jsonPayload ? JSON.parse(jsonPayload) : {}
    fieldNames.filter((name) => request.formValue(name) !== "").forEach((name) => {
        values[name] = request.formValue(name)
    })

    return values
}

// PocketBase drops hidden fields from non-superuser request bodies, which would save every contact form empty.
function restoreSubmittedContactFields(e) {
    const fieldNames = protectedFieldNames(e.collection)
    if (!fieldNames.length) {
        return
    }

    const values = submittedValues(e, fieldNames)
    fieldNames.filter((name) => name in values).forEach((name) => e.record.set(name, values[name]))
}

function needsHiding(collection) {
    return protectedFieldNames(collection).some((name) => !collection.fields.getByName(name).getHidden())
}

module.exports = {
    hideContactFields,
    recordHiddenFields,
    releaseContactFields,
    forgetReleasedFields,
    restoreSubmittedContactFields,
    needsHiding,
}
