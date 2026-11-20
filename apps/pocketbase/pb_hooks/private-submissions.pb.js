/// <reference path="../pb_data/types.d.ts" />

// Reads cost nothing per record: PocketBase enforces the hidden flag itself. JS runs on schema changes and on
// create/update requests, once per request.
onCollectionCreate((e) => {
    const { hideContactFields, recordHiddenFields } = require(`${__hooks}/private-submissions.js`)
    const { newlyHidden } = hideContactFields(e.collection)

    e.next()
    recordHiddenFields(e.app, e.collection, newlyHidden)
})

onCollectionUpdate((e) => {
    const lib = require(`${__hooks}/private-submissions.js`)
    const { isProtected, newlyHidden } = lib.hideContactFields(e.collection)
    const released = isProtected ? [] : lib.releaseContactFields(e.app, e.collection)

    e.next()
    lib.recordHiddenFields(e.app, e.collection, newlyHidden)
    lib.forgetReleasedFields(e.app, e.collection, released)
})

function restoreForVisitors(e) {
    if (!e.hasSuperuserAuth()) {
        require(`${__hooks}/private-submissions.js`).restoreSubmittedContactFields(e)
    }

    e.next()
}

onRecordCreateRequest(restoreForVisitors)
onRecordUpdateRequest(restoreForVisitors)

// Collections created before this hook existed; saving one runs onCollectionUpdate above.
onBootstrap((e) => {
    e.next()

    const { needsHiding } = require(`${__hooks}/private-submissions.js`)
    // One collection that fails to save must not stop PocketBase from starting, or the rest from being hidden.
    e.app.findAllCollections().filter(needsHiding).forEach((collection) => {
        try {
            e.app.save(collection)
        } catch (err) {
            e.app.logger().error("private-submissions: failed to hide contact fields", "collection", collection.name, "error", String(err))
        }
    })
})
