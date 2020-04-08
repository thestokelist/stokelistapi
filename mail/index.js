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
http://post.thestoke.ca/d/19dc22d8-38f0-4008-ab95-a2e7104b5dbe
        
Thanks, The Stoke List.`
});
}

module.exports = sendPostValidationMessage