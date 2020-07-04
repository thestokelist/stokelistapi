exports.removeUnusedUploads = async () => {
    const Media = require('../models/media')
    await Media.removeUnusedUploads()
}

exports.processNewEmails = async () => {
    const gmailUser = process.env.GMAIL_USER
    if (gmailUser && gmailUser !== '') {
        const { ImapFlow } = require('imapflow')
        const simpleParser = require('mailparser').simpleParser
        const { forwardValidEmail, forwardInvalidEmail } = require('../mail')
        const Post = require('../models/post')
        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: gmailUser,
                pass: process.env.GMAIL_PASS,
            },
        })
        await client.connect()
        let lock = await client.getMailboxLock('INBOX')
        try {
            // fetch latest message source
            let seqList = await client.search({ seen: false })
            for (let seq of seqList) {
                let { content } = await client.download(seq)
                let parsed = await simpleParser(content)
                const senderAddress = parsed.to.value[0].address
                const subject = parsed.subject
                const body = parsed.html
                const attachments = parsed.attachments
                const validEmail = new RegExp(
                    process.env.EMAIL_PREFIX + '\\+(\\d+)\\@.*'
                )
                const matches = validEmail.exec(senderAddress)
                try {
                    if (matches) {
                        const postId = matches[1]
                        if (postId) {
                            console.log('This is a valid email', postId)
                            const post = await Post.findByPk(postId)
                            if (post) {
                                forwardValidEmail(
                                    post.email,
                                    senderAddress,
                                    subject,
                                    body,
                                    attachments
                                )
                            }
                        }
                    } else {
                        console.log(
                            `Invalid email from ${senderAddress}, forwarding for review`
                        )
                        forwardInvalidEmail(
                            senderAddress,
                            subject,
                            body,
                            attachments
                        )
                    }
                } catch (err) {
                    //If email send fails, star the email
                    await client.messageCopy(seq, '[Gmail]/Starred')
                } finally {
                    //Regardless of what happened, mark the messge as seen now
                    await client.messageFlagsAdd(seq, ['\\Seen'])
                }
            }
        } finally {
            // Make sure lock is released, otherwise next `getMailboxLock()` never returns
            lock.release()
        }

        // log out and close connection
        await client.logout()
    } else {
        console.log('Skipping email check, no gmail user defined')
    }
}
