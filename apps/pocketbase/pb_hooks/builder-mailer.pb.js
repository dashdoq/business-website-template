
/// <reference path="../pb_data/types.d.ts" />
onMailerSend((e) => {
    if (e.app.settings().smtp.enabled) {
        return e.next()
    }

    const senderAddress = $os.getenv("BUILDER_MAILER_SENDER_ADDRESS");
    const recipients = (e.message.to || []).map((recipient) => recipient.address).filter(Boolean);
    const cc = (e.message.cc || []).map((recipient) => recipient.address).filter(Boolean);
    const bcc = (e.message.bcc || []).map((recipient) => recipient.address).filter(Boolean);
    // builder-mail takes 10 files of these types and a 10 MB JSON body, and base64 grows files by a third.
    const allowedExtensions = ["csv", "doc", "docx", "gif", "heic", "ics", "jpeg", "jpg", "odp", "ods", "odt", "pdf", "png", "ppt", "pptx", "rtf", "txt", "webp", "xls", "xlsx"];
    const maxAttachments = 10;
    const maxAttachmentMegabytes = 7;
    const maxAttachmentBytes = maxAttachmentMegabytes * 1024 * 1024;
    // Transactional mail only: the shared sender domain must not carry bulk sends.
    const maxRecipients = 10;

    if (!recipients.length) {
        throw new BadRequestError("Email has no recipient address");
    }

    if (recipients.length + cc.length + bcc.length > maxRecipients) {
        throw new BadRequestError(`The built-in mailer sends each email to at most ${maxRecipients} recipients (to, cc and bcc together). It is for transactional email, not bulk sends.`);
    }

    // MailChannels has no inline (cid) attachments, so inline files arrive as regular ones.
    const allEntries = Object.entries({ ...(e.message.attachments || {}), ...(e.message.inlineAttachments || {}) });
    const isAllowed = ([filename]) => filename.includes(".") && allowedExtensions.includes(filename.split(".").pop().toLowerCase());
    const entries = allEntries.filter(isAllowed);
    const blockedFiles = allEntries.filter((entry) => !isAllowed(entry)).map(([filename]) => filename);
    // Read only within the byte budget; it goes negative (and reading stops) once any limit is exceeded.
    let remainingBytes = entries.length <= maxAttachments ? maxAttachmentBytes : -1;
    const files = entries.map(([filename, reader]) => {
        const bytes = remainingBytes < 0 ? [] : toBytes(reader, remainingBytes + 1);
        remainingBytes -= bytes.length;
        return { filename, bytes };
    });
    const fitsLimit = remainingBytes >= 0;
    const attachments = fitsLimit ? files.map((file) => ({ "filename": file.filename, "content": Buffer.from(file.bytes).toString("base64") })) : [];
    const droppedFiles = [...blockedFiles, ...(fitsLimit ? [] : files.map((file) => file.filename))];

    let html = e.message.html;
    let text = e.message.text;

    if (droppedFiles.length) {
        const fileList = droppedFiles.join(", ");

        // The sandbox is the only place the coding agent sends test mail, so fail its test send; live sites keep getting the text.
        if ($os.getenv("NODE_ENV") === "development") {
            throw new BadRequestError(`The built-in mailer delivers at most ${maxAttachments} attachments and ${maxAttachmentMegabytes} MB per email, of these types: ${allowedExtensions.join(", ")}. Send download links in the email body instead. Attachments: ${fileList}`);
        }

        $app.logger().error("Email attachments not delivered", "files", droppedFiles, "subject", e.message.subject);

        const notice = `These attachments could not be delivered: ${fileList}`;
        const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (html) {
            html += `<p>${escapeHtml(notice)}</p>`;
        } else {
            text = `${text || ""}\n\n${notice}`;
        }
    }

    // builder-mail takes one "to" address per email, so each recipient gets their own send; cc/bcc ride on the first.
    recipients.forEach((to, index) => {
        const payload = {
            "subject": e.message.subject,
            "content": {
                ...(html ? {
                    "html": html,
                } : {
                    "plain": text,
                }),
                "type": "plain",
            },
            "from": senderAddress,
            "fromName": e.message.from?.name,
            "replyTo": senderAddress,
            "to": to,
            ...(index === 0 && cc.length ? { "cc": cc } : {}),
            ...(index === 0 && bcc.length ? { "bcc": bcc } : {}),
            ...(attachments.length ? { "attachments": attachments } : {}),
        }

        const response = $http.send({
            url: `${$os.getenv("BUILDER_MAILER_API_URL")}/api/v2/email`,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${$os.getenv("BUILDER_MAILER_API_KEY")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.statusCode !== 200) {
            $app.logger().error("Failed to send email", "error", response.json);

            throw new ApiError(500, response.json?.message || 'Failed to send email');
        }
    });
})
