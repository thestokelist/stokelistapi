const postmark = require('postmark')
const dotenv = require('dotenv')
dotenv.config()

const client = new postmark.Client(process.env.POSTMARK_KEY)

exports.sendPostValidationMessage = (post) => {
    client.sendEmail({
        From: 'list@thestoke.ca',
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
        From: 'list@thestoke.ca',
        To: user.email,
        Subject: `Your Stoke List Login`,
        TextBody: `You're *almost* done!

You must click the link below in order to login to your account

${process.env.REACT_APP_URL}/login/${user.loginToken}?email=${user.email}

If you didn't request this email, we're sorry - you can just ignore it
        
Thanks, The Stoke List.`,
    })
}
