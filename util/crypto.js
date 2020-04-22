const crypto = require('crypto')

exports.createHmac = (secret,challenge) => {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(challenge)
    return hmac.digest('hex')
}