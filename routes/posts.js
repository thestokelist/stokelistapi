const Router = require('express-promise-router')
const sequelize = require('../db')
const { sendPostValidationMessage } = require('../mail')
const { Op } = require('sequelize')
const Post = require('../models/post')
const User = require('../models/user')
const sanitizeHtml = require('sanitize-html')
const validator = require('validator')
const crypto = require('crypto')
const Cookies = require('universal-cookie')

// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router

const postAttributes = [
    'id',
    'title',
    'price',
    'location',
    'description',
    'photoFileSize',
    'exactLocation',
]

const stokeListSanitize = (dirty) =>
    sanitizeHtml(dirty, {
        allowedTags: ['b', 'i', 'p', 'br', 'a', 'img'],
        allowedAttributes: {
            a: ['href'],
            img: ['src', 'alt'],
        },
    })

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
        const hmac = crypto.createHmac('sha256', user.secret)
        hmac.update(challenge)
        if (hmac.digest('hex') === challengeHmac) {
            console.log(`Authentication successful for ${email}`)
            return user
        } else {
            console.log(`Authentication failed for ${email}`)
            return null
        }
    } catch (e) {
        console.log(`Error authenticating ${email}`)
        return null
    }
}

//Get 50 latests posts, with optional offset
router.get('/', async (req, res) => {
    //TODO: Only get description snippet, don't need whole thing
    const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            sticky: false,
            emailVerified: true,
        },
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: offset,
    })
    res.json(posts)
})

//Get 50 posts that correspond to the search term, with optional offset
router.get('/search', async (req, res) => {
    //TODO: Sequelize should sanitize this for basic attacks, is there more to do here?
    const query = '%' + req.query.term + '%'
    const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            [Op.or]: {
                description: {
                    [Op.iLike]: query,
                },
                title: {
                    [Op.iLike]: query,
                },
            },
            emailVerified: true,
        },
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: offset,
    })
    res.json(posts)
})

//Get all sticky posts
router.get('/sticky', async (req, res) => {
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            sticky: true,
        },
        order: [['created_at', 'DESC']],
    })
    res.json(posts)
})

//Get all sticky posts
router.get('/mine', async (req, res) => {
    let user = await getUserFromCookies(req.headers.cookie)
    if (user === null) {
        return res.sendStatus(401)
    }
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            email: user.email,
        },
    })
    return res.json(posts)
})

//Get a single post, by public ID
router.get('/:id', async (req, res) => {
    const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
    const post = await Post.findOne({
        attributes: postAttributes.concat(['created_at']),
        where: {
            id: postID,
            emailVerified: true,
        },
        order: [['created_at', 'DESC']],
    })
    res.json(post)
})

//Validate a single post, by private guid
router.post('/v/:uuid', async (req, res) => {
    const postUUID = validator.isUUID(req.params.uuid) ? req.params.uuid : null
    let post = await Post.findOne({
        where: {
            guid: postUUID,
        },
    })
    try {
        //TODO: Make sure email isn't already verified
        post.emailVerified = true
        post.save()
        const user = await User.findOne({
            where: {
                email: post.email,
            },
        })
        const hmac = crypto.createHmac('sha256', user.secret)
        hmac.update(postUUID)
        const returnObject = { post, hmac: hmac.digest('hex') }
        res.status(200).send(returnObject)
    } catch (err) {
        console.log(err.message)
        res.status(500).send(err.message)
    }
})

//Delete a single post, by private guid
router.delete('/:id', async (req, res) => {
    let user = await getUserFromCookies(req.headers.cookie)
    const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
    if (user !== null && postID !== null) {
        let post = await Post.findOne({
            where: {
                id: postID,
            },
        })
        if (post && post.email === user.email) {
            await post.destroy()
            return res.sendStatus(204)
        } else {
            return res.sendStatus(401)
        }
    }
})

//Create a new post
router.post('/', async (req, res) => {
    const post = await Post.build({
        title: stokeListSanitize(req.body.title) || null,
        description: stokeListSanitize(req.body.description) || null,
        price: stokeListSanitize(req.body.price) || null,
        email: req.body.email || null,
        location: req.body.location || null,
        exactLocation: req.body.exactLocation || null,
    })
    post.remoteIp =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress
    try {
        await post.save()
        sendPostValidationMessage(post)
        res.sendStatus(200)
    } catch (err) {
        console.log(err.message)
        res.status(500).send(err.message)
        return
    }
})
