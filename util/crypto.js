const jwt = require('jsonwebtoken')

exports.createToken = (email) => {
    const payload = { email: email }
    //Return 1 month auth token with user ID, same length as cookie expiration
    const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: '30 days',
    })
    return token
}