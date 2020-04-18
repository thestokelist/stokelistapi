const Router = require('express-promise-router')
const crypto = require('crypto')
const validator = require('validator')
const { v4 }= require('uuid');

const User = require('../models/user')
const { sendLoginMessage }= require ('../mail')


const router = new Router()
module.exports = router


//Triggers an email the send out a login link
//TODO Move email to a body param
router.post('/:email', async (req, res) => {
  const email = validator.isEmail(req.params.email) ? req.params.email : null
  if (email === null) {
    res.sendStatus(400)
    return
  }
  let [user] = await User.findOrCreate({
    where: {
      email: email    
    }
  })
  user.loginToken = v4();
  console.log(user)
  await user.save()
  sendLoginMessage(user)
  res.sendStatus(200)
})


//TODO: Move from GET to POST once integrated with UI
//Validates a user login with magic token, clears that token, returns hmac for authentication
router.get('/:uuid', async (req, res) => {
  const uuid = validator.isUUID(req.params.uuid) ? req.params.uuid : null
  if (uuid === null) {
    res.sendStatus(400)
    return
  }
  let user = await User.findOne({
    where: {
      loginToken: uuid    
    }
  })
    //TODO validate updated_at within last 24 hours
  if (user === null) {
    res.sendStatus(404)
    return
  }
  user.loginToken = null
  await user.save()
  const hmac = crypto.createHmac('sha256', user.secret);
  hmac.update(uuid)
  res.status(200).send(hmac.digest('hex'))
})