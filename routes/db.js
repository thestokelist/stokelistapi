const Router = require('express-promise-router')
const Post = require('../models/post')
const User = require('../models/user')

const router = new Router()
module.exports = router

//TODO: Admin authentication needed here
router.post('/sync', async (req, res) => {
    Post.sync({ alter: true })
    User.sync({ alter: true })
    res.sendStatus(200);
  })