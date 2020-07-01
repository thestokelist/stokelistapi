const Router = require('express-promise-router')
const passport = require('passport')

const Post = require('../models/post')
const User = require('../models/user')
const Report = require('../models/report')
const Media = require('../models/media')

// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()
// export our router to be mounted by the parent application
module.exports = router

const adminPostAttributes = [
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

//Get all posts by the person who made a specific post
router.get(
    '/judge/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        if (postID !== null) {
            let initialPost = await Post.findByPk(postID)
            if (initialPost) {
                //Any posts from this email address, including previously deleted posts
                const judgementPosts = await Post.findAll({
                    attributes: adminPostAttributes,
                    where: {
                        email: initialPost.email,
                    },
                    paranoid: false,
                })
                return res.json(judgementPosts)
            }
        }
        return res.sendStatus(404)
    }
)

//Ban the user who made a specific post
router.delete(
    '/judge/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        if (postID !== null) {
            let initialPost = await Post.findByPk(postID)
            if (initialPost) {
                //Delete any posts from this user
                await Post.destroy({
                    where: {
                        email: initialPost.email,
                    },
                })
                //Set the user as banned
                let [user] = await User.findOrCreate({
                    where: {
                        email: initialPost.email,
                    },
                })
                user.bannedAt = new Date()
                await user.save()
                return res.sendStatus(204)
            }
        }
        return res.sendStatus(404)
    }
)

//Get all posts in the moderation queue
router.get(
    '/moderate',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        if (req.user.isAdmin === true) {
            //These posts are moderated, so we'll need signed URL's for their images
            const moderatedPosts = await Post.findAll({
                attributes: adminPostAttributes,
                where: {
                    moderated: true,
                },
                include: [
                    {
                        model: Report,
                        as: 'reports',
                    },
                    {
                        model: Media,
                        as: 'media',
                    },
                ],
                order: [['created_at', 'DESC']],
            })
            //These posts are just reported, so their images will work
            const reportedPosts = await Post.findAll({
                attributes: adminPostAttributes,
                where: {
                    moderated: false,
                },
                include: [
                    {
                        model: Report,
                        required: true,
                        as: 'reports',
                    },
                    {
                        model: Media,
                        as: 'media',
                    },
                ],
                order: [['created_at', 'DESC']],
            })
            const signedModeratedPostsJSON = await Promise.all(
                moderatedPosts.map(async (post) => {
                    const signedPost = await post.toJSONSigned()
                    return signedPost
                })
            )
            const reportedPostsJSON = reportedPosts.map((post) => post.toJSON())
            const allModeratedPosts = signedModeratedPostsJSON.concat(
                reportedPostsJSON
            )
            console.log(`Returning ${allModeratedPosts.length} moderated posts`)
            return res.json(allModeratedPosts)
        } else {
            res.sendStatus(403)
        }
    }
)

//Approve a single post from the mod queue
router.put(
    '/approve/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
        console.log(`Approving post with id ${postID}`)
        if (postID && req.user.isAdmin === true) {
            let post = await Post.findByPk(postID, {
                paranoid: false,
                include: [
                    {
                        model: Media,
                        as: 'media',
                    },
                ],
            })
            if (post !== null) {
                //Set the post as no longer moderated, delete any associated reports
                await Report.destroy({
                    where: { post_id: post.id },
                })
                //Restore a post if it was previously deleted
                if (post.deleted_at !== null) {
                    await post.restore()
                    //TODO: Use hooks to restore media too
                }
                post.moderated = false
                await post.publiciseMedia()
                await post.save()
                console.log(`Approved post with id ${postID}`)
                return res.sendStatus(204)
            }
        }
        console.log(`Unable to approve post with id ${postID}`)
        return res.sendStatus(403)
    }
)
