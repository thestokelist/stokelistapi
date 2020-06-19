const Router = require('express-promise-router')

const Report = require('../models/report')

const Post = require('../models/post')

const router = new Router()
module.exports = router

//Report a post
router.post('/:id', async (req, res) => {
    console.log(`Creating new post report`)
    const postID = !isNaN(req.params.id) ? parseInt(req.params.id) : null
    if (postID !== null) {
        let post = await Post.findByPk(postID)
        if (post !== null) {
            const existingReports = await Report.findAll({
                where: { post_id: postID },
                paranoid: false,
            })
            //Check if someone has already reported this post using this IP
            //Or if the post was previously reported, and moderatir approved
            let reportExists = false
            let deletedReports = false
            console.log(existingReports)
            for (let report of existingReports) {
                if (report.remoteIp === req.ip) {
                    reportExists = true
                }
                if (report.deleted_at !== null) {
                    deletedReports = true
                }
            }
            if (reportExists || deletedReports) {
                console.log('Skipping report creation')
                //No need to do anything - if the report exists from this IP, we don't need to create it
                //and if there are deleted reports for this post, it's already been approved
            } else {
                const report = await Report.build({
                    reason: req.body.reason || null,
                    comment: req.body.comment || null,
                    remoteIp: req.ip,
                    post_id: postID,
                })
                try {
                    console.log('Validating new report')
                    await report.validate()
                } catch (e) {
                    console.log('New report validation failed')
                    return res.sendStatus(422)
                }
                await report.save()
                console.log('New report created')
                const reportCount = await Report.count({
                    where: { post_id: postID },
                })
                console.log(
                    `Total number of reports for this post is ${reportCount}`
                )
                if (reportCount >= 1) {
                    post.moderated = true
                    await post.save()
                }
            }
            //Whether we actually created a report or not, say we did
            return res.sendStatus(204)
        }
    }
    return res.sendStatus(404)
})
