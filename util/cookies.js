const Cookies = require('universal-cookie')
const User = require('../models/user')

const { createHmac } = require('./crypto')

exports.getUserFromCookies = async (cookie) => {
    const cookies = new Cookies(cookie)
    const email = cookies.get('email')
    const challengeHmac = cookies.get('hmac')
    const challenge = cookies.get('challenge')
    let retUser = null;
    if (email && challengeHmac && challenge) {
        try {
            const user = await User.findOne({
                where: {
                    email: email,
                },
            })
            if (createHmac(user.secret, challenge) === challengeHmac) {
                console.log(`Authentication successful for ${email}`)
                retUser = user
            } else {
                console.log(`Authentication failed for ${email}`)
            }
        } catch (e) {
            console.log(`Error authenticating ${email}`)
            console.log(e)
        }
    } else {
        console.log(`Authentication error: no credentials provided`)
    }
    return retUser

}
