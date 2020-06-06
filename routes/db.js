const Router = require('express-promise-router')
const Post = require('../models/post')
const User = require('../models/user')
const Report = require('../models/report')

const router = new Router()
module.exports = router

//TODO: Admin authentication needed here
router.post('/sync', async (req, res) => {
    await Post.sync({ alter: true })
    await User.sync({ alter: true })
    await Report.sync({ alter: true })
    res.sendStatus(200)
})
