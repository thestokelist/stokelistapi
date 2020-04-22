const Cookies = require('universal-cookie')
const User = require('../models/user')

const { createHmac } = require('./crypto')

async function getUserFromCookies(cookie) {
    const cookies = new Cookies(cookie)
    const email = cookies.get('email')
    const challengeHmac = cookies.get('hmac')
    const challenge = cookies.get('challenge')
    try {
        const user = await User.findOne({
            where: {
                email: email,
            },
        })
        if (createHmac(user.secret,challenge) === challengeHmac) {
            console.log(`Authentication successful for ${email}`)
            return user
        } else {
            console.log(`Authentication failed for ${email}`)
            return null
        }
    } catch (e) {
        console.log(`Error authenticating ${email}`)
        console.log(e)
        return null
    }
}

exports.getUserFromCookies = getUserFromCookies