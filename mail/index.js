const postmark = require("postmark");
const dotenv = require('dotenv')
dotenv.config()

const client = new postmark.Client(process.env.POSTMARK_KEY);

const sendPostValidationMessage = post => {
    client.sendEmail({
        "From": "list@thestoke.ca",
        "To": post.email,
        "Subject": `Your Stoke List Post: ${post.title}`,
        "TextBody": 
`You're *almost* done!

You must click the link below in order to verify your email address:
        
http://${process.env.HOSTNAME}/posts/v/${post.guid}
        
10 minutes after that, you should see your post live.
        
        
To DELETE your post at any time, please visit this link:
http://${process.env.HOSTNAME}/posts/d/${post.guid}
        
Thanks, The Stoke List.`
});
}

module.exports = sendPostValidationMessage