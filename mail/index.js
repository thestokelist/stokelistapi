const postmark = require('postmark')

const client = new postmark.Client(process.env.POSTMARK_KEY)
const adminEmail = process.env.ADMIN_EMAIL
const fromEmail = process.env.POSTMARK_SENDER

exports.sendPostValidationMessage = (post) => {
    client.sendEmail({
        From: fromEmail,
        To: post.email,
        Subject: `Your Stoke List Post: ${post.title}`,
        TextBody: `You're *almost* done!

You must click the link below in order to verify your email address:
        
${process.env.REACT_APP_URL}/post/v/${post.guid}
        
10 minutes after that, you should see your post live.
        
        
To manage your posts at any time, please visit this link:
${process.env.REACT_APP_URL}/myposts
        
Thanks, The Stoke List.`,
    })
}

exports.sendLoginMessage = (user) => {
    client.sendEmail({
        From: fromEmail,
        To: user.email,
        Subject: `Your Stoke List Login`,
        TextBody: `You're *almost* done!

You must click the link below in order to login to your account

${process.env.REACT_APP_URL}/login/${user.loginToken}?email=${user.email}

If you didn't request this email, we're sorry - you can just ignore it
        
Thanks, The Stoke List.`,
    })
}

exports.forwardInvalidEmail = (sender, subject, htmlBody, attachments) => {
    if (adminEmail && adminEmail !== '') {
        const postmarkAttachments = []
        let removedAttachments = []
        let totalSize = 0
        
        if (attachments && attachments.length) {
            // First pass: calculate total size and identify large attachments
            attachments.forEach((attachment) => {
                const size = attachment.content.length
                if (size > 10 * 1024 * 1024) { // 10MB in bytes
                    removedAttachments.push({
                        name: attachment.filename,
                        size: (size / (1024 * 1024)).toFixed(2) + 'MB'
                    })
                } else {
                    totalSize += size
                    postmarkAttachments.push({
                        Content: attachment.content.toString('base64'),
                        ContentType: attachment.contentType,
                        Name: attachment.filename,
                    })
                }
            })
            
            // Add note about removed attachments if any were removed
            if (removedAttachments.length > 0) {
                const note = `<br><br><strong>Note:</strong> The following attachments were removed because they exceeded our 10MB size limit:<br><ul>${removedAttachments.map(att => `<li>${att.name} (${att.size})</li>`).join('')}</ul>`
                htmlBody += note
            }
        }
        
        const email = {
            From: fromEmail,
            To: adminEmail,
            ReplyTo: sender,
            Subject: subject,
            HtmlBody: htmlBody,
            Attachments: postmarkAttachments,
        }
        client.sendEmail(email)
    }
}

exports.forwardValidEmail = (
    recipient,
    sender,
    subject,
    htmlBody,
    attachments
) => {
    const postmarkAttachments = []
    let removedAttachments = []
    let totalSize = 0
    
    if (attachments && attachments.length) {
        // First pass: calculate total size and identify large attachments
        attachments.forEach((attachment) => {
            const size = attachment.content.length
            if (size > 10 * 1024 * 1024) { // 10MB in bytes
                removedAttachments.push({
                    name: attachment.filename,
                    size: (size / (1024 * 1024)).toFixed(2) + 'MB'
                })
            } else {
                totalSize += size
                postmarkAttachments.push({
                    Content: attachment.content.toString('base64'),
                    ContentType: attachment.contentType,
                    Name: attachment.filename,
                })
            }
        })
        
        // Add note about removed attachments if any were removed
        if (removedAttachments.length > 0) {
            const note = `<br><br><strong>Note:</strong> The following attachments were removed because they exceeded our 10MB size limit:<br><ul>${removedAttachments.map(att => `<li>${att.name} (${att.size})</li>`).join('')}</ul>`
            htmlBody += note
        }
    }
    
    const emailContents = {
        From: fromEmail,
        To: recipient,
        ReplyTo: sender,
        Subject: subject,
        HtmlBody: htmlBody,
        Attachments: postmarkAttachments,
    }
    client.sendEmail(emailContents)
}
