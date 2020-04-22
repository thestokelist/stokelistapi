const Router = require('express-promise-router')
const validator = require('validator')
const { v4 } = require('uuid')

const User = require('../models/user')
const { sendLoginMessage } = require('../mail')
const { createHmac } = require('../util/crypto')
const { dateWithin24Hours } = require('../util/date')

const router = new Router()
module.exports = router

//Triggers an email the send out a login link
router.post('/', async (req, res) => {
    const email = validator.isEmail(req.body.email) ? req.body.email : null
    if (email === null) {
        console.log(`Error when trying to send login link to ${email}`)
        return res.sendStatus(400)
    }
    console.log(`Sending login link to ${email}`)
    let [user] = await User.findOrCreate({
        where: {
            email: email,
        },
    })
    user.loginToken = v4()
    await user.save()
    sendLoginMessage(user)
    return res.sendStatus(200)
})

//Validates a user login with magic token, clears that token, returns hmac for authentication
router.post('/:uuid', async (req, res) => {
    const uuid = validator.isUUID(req.params.uuid) ? req.params.uuid : null
    const email =
        req.body.email && validator.isEmail(req.body.email)
            ? req.body.email
            : null
    if (uuid === null || email === null) {
        console.log(`Error handling login with login token ${uuid} and email ${email}`)
        return res.sendStatus(400)
    }
    let user = await User.findOne({
        where: {
            loginToken: uuid,
            email: email,
        },
    })
    console.log(user.toJSON())
    if (user === null || !dateWithin24Hours(user.updated_at)) {
        console.log(`Error logging in user with login token ${uuid} and email ${email}`)
        return res.sendStatus(404)
    }
    user.loginToken = null
    await user.save()
    console.log(`Succesfully logged in user with email ${email}`)
    return res.status(200).send(createHmac(user.secret,uuid))
})
