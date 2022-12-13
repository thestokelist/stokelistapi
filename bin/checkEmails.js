const processNewEmails = async () => {
    try {
        const gmailUser = process.env.GMAIL_USER
        if (gmailUser && gmailUser !== '') {
            const emailPart = gmailUser.split('@')[0]
            const { ImapFlow } = require('imapflow')
            const simpleParser = require('mailparser').simpleParser
            const {
                forwardValidEmail,
                forwardInvalidEmail,
            } = require('../mail')
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
                    const toAddress = parsed.to.value[0].address
                    const fromAddress = parsed.from.value[0].address
                    const subject = parsed.subject
                    const body = parsed.html ? parsed.html : parsed.textAsHtml
                    const attachments = parsed.attachments
                    //If gmail user is user@gmail.com
                    //A valid email is an email send to user+postID@gmail.com
                    const validEmail = new RegExp(emailPart + '\\+(\\d+)\\@.*')
                    const matches = validEmail.exec(toAddress)
                    try {
                        if (matches) {
                            const postId = matches[1]
                            if (postId) {
                                console.log('This is a valid email', postId)
                                const post = await Post.findByPk(postId)
                                if (post) {
                                    forwardValidEmail(
                                        post.email,
                                        fromAddress,
                                        subject,
                                        body,
                                        attachments
                                    )
                                }
                            }
                        } else {
                            console.log(
                                `Invalid email from ${fromAddress}, forwarding for review`
                            )
                            forwardInvalidEmail(
                                fromAddress,
                                subject,
                                body,
                                attachments
                            )
                        }
                    } catch (err) {
                        console.log('Error in forwarding email', err)
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
    } catch (e) {
        console.log('Error checking emails', e)
    }
}

processNewEmails()
