const Router = require('express-promise-router')
const { sendPostValidationMessage } = require('../mail')
const { Op } = require('sequelize')
const Post = require('../models/post')
const User = require('../models/user')
const validator = require('validator')
const passport = require('passport')
const Recaptcha = require('express-recaptcha').RecaptchaV3
const dotenv = require('dotenv')
dotenv.config()
const recaptcha = new Recaptcha(process.env.CAPTCHA_KEY, process.env.CAPTCHA_SECRET)

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
    'isGarageSale',
    'startTime',
    'endTime',
    'created_at',
]

const trimPostDescriptions = (postsToTrim) => {
    let trimmedPosts = []
    for (const post of postsToTrim) {
        const postJSON = post.toJSON()
        if (postJSON.description.length > 143) {
            let words = postJSON.description.split(' ')
            let trimmedDescription = ''
            for (const word of words) {
                trimmedDescription += word + ' '
                if (trimmedDescription.length > 140) {
                    trimmedDescription += '...'
                    break
                }
            }
            postJSON.description = trimmedDescription.replace(/\r?\n|\r/g, '  ')
        }
        trimmedPosts.push(postJSON)
    }
    return trimmedPosts
}

//Get 50 latests posts, with optional offset
router.get('/', async (req, res) => {
    //TODO: Only get description snippet, don't need whole thing
    const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0
    console.log(`Loading latest posts with offset ${offset}`)
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
    return res.json(trimPostDescriptions(posts))
})

//Returns all future garage sales
router.get('/garage', async (req, res) => {
    console.log(`Loading garage sales`)
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            emailVerified: true,
            isGarageSale: true,
            endTime: { [Op.gt]: new Date().toISOString() },
        },
    })
    return res.json(trimPostDescriptions(posts))
})

//Get 50 posts that correspond to the search term, with optional offset
router.get('/search', async (req, res) => {
    //TODO: Sequelize should sanitize this for basic attacks, is there more to do here?
    const query = '%' + req.query.term + '%'
    const offset = !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0
    console.log(
        `Running search for query term ${req.query.term} with offset ${offset}`
    )
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
    return res.json(trimPostDescriptions(posts))
})

//Get all sticky posts
router.get('/sticky', async (req, res) => {
    console.log('Loading sticky posts')
    const posts = await Post.findAll({
        attributes: postAttributes,
        where: {
            sticky: true,
        },
        order: [['created_at', 'DESC']],
    })
    return res.json(trimPostDescriptions(posts))
})

//Get all posts made by an authenticated user
router.get(
    '/mine',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const userEmail = req.user.email
        console.log(`Loading posts for user: ${userEmail}`)
        const posts = await Post.findAll({
            attributes: postAttributes,
            where: {
                email: userEmail,
                emailVerified: true,
            },
            order: [['created_at', 'DESC']],
        })
        return res.json(trimPostDescriptions(posts))
    }
)

//Get a single post, by public ID
router.get('/:id', async (req, res) => {
    const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
    console.log(`Loading posts for id ${postID}`)
    const post = await Post.findOne({
        attributes: postAttributes,
        where: {
            id: postID,
            emailVerified: true,
        },
    })
    return res.json(post)
})

//Validate a single post, by private guid
router.post('/v/:uuid', async (req, res) => {
    const postUUID = validator.isUUID(req.params.uuid) ? req.params.uuid : null
    console.log(`Validating post with uuid ${postUUID}`)
    let post = await Post.findOne({
        where: {
            guid: postUUID,
        },
    })
    if (post && post.emailVerified === false) {
        post.emailVerified = true
        await post.save()
        //Handle any posts created in the old system, but not yet verified by
        //doing a findOrCreate here
        let [user] = await User.findOrCreate({
            where: {
                email: post.email,
            },
        })
        const returnObject = { post, token: user.generateToken() }
        console.log(`Validated post with uuid ${postUUID}`)
        return res.status(200).send(returnObject)
    } else {
        console.log(`Unable to validate post with uuid ${postUUID}`)
        return res.sendStatus(404)
    }
})

//Delete a single post, by id, with authentication
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        console.log(`Attempting to delete post with id ${req.params.id}`)
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        //If logged in and post ID is a valid number
        const userEmail = req.user.email
        if (postID !== null) {
            let post = await Post.findByPk(postID)
            if (post && post.email === userEmail) {
                await post.destroy()
                console.log(`Deleted post with id ${postID}`)
                return res.sendStatus(204)
            }
        }
        console.log(`Error deleting post with id ${postID}`)
        return res.sendStatus(403)
    }
)

//Undelete a single post, by id, with authentication
//Not entirely RESTful, using PATCH here
router.patch(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        console.log(`Attempting to delete post with id ${req.params.id}`)
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        //If logged in and post ID is a valid number
        const userEmail = req.user.email
        if (postID !== null) {
            let post = await Post.findByPk(postID, { paranoid: false })
            if (post && post.email === userEmail) {
                await post.restore()
                console.log(`Undeleted post with id ${postID}`)
                return res.sendStatus(204)
            }
        }
        console.log(`Error undeleting post with id ${postID}`)
        return res.sendStatus(403)
    }
)

//Update a single post, by id, with authentication
router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        console.log(`Attempting to update post with id ${req.params.id}`)
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        if (postID !== null) {
            let post = await Post.findByPk(postID)
            const userEmail = req.user.email
            if (post && post.email === userEmail) {
                post.title = req.body.title || null
                post.description = req.body.description || null
                post.price = req.body.price || null
                post.location = req.body.location || null
                post.exactLocation = req.body.exactLocation || null
                post.isGarageSale = req.body.isGarageSale || false
                post.startTime = req.body.startTime || null
                post.endTime = req.body.endTime || null
                try {
                    await post.validate()
                } catch (e) {
                    console.log('New post validation failed')
                    return res.sendStatus(422)
                }
                await post.save()
                console.log(`Updated post with id ${postID}`)
                return res.json(post)
            }
        }
        console.log(`Error updating post with id ${postID}`)
        return res.sendStatus(403)
    }
)

//Create a new post
router.post('/', recaptcha.middleware.verify, async (req, res) => {
    console.log(`Building new post`)
    const recaptcha = req.recaptcha
    const passingScore = parseFloat(process.env.CAPTCHA_SCORE) || 0.5
    if (!recaptcha.error && recaptcha.data.action === "post" && recaptcha.data.score > passingScore) {
        console.log('Valid captcha token')
        console.log(req.recaptcha)
        const post = await Post.build({
            title: req.body.title || null,
            description: req.body.description || null,
            price: req.body.price || null,
            email: req.body.email || null,
            location: req.body.location || null,
            exactLocation: req.body.exactLocation || null,
            isGarageSale: req.body.isGarageSale || false,
            startTime: req.body.startTime || null,
            endTime: req.body.endTime || null,
        })
        post.remoteIp =
            req.headers['x-forwarded-for'] || req.connection.remoteAddress
        try {
            await post.validate()
        } catch (e) {
            console.log('New post validation failed')
            return res.sendStatus(422)
        }
        await post.save()
        sendPostValidationMessage(post)
        console.log(`New post saved and validation email sent to ${post.email}`)
        return res.sendStatus(200)
    } else {
        //Throw invalid response if captcha auth fails
        console.log('Invalid captcha token')
        console.log(req.recaptcha)
        return res.sendStatus(422)
    }
})
