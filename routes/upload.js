const Router = require('express-promise-router')
const Media = require('../models/media')
const { uploadMiddleware, getSignedUrl } = require('../util/s3')
const router = new Router()
module.exports = router

//Upload an attachment
router.post('/', uploadMiddleware, async (req, res) => {
    console.log(`Creating new post attachment`)
    try {
        //upload middleware has done the s3 upload, req.file is the response
        const file = req.file
        const media = new Media({
            link: file.location,
            name: '',
            type: file.mimetype,
            key: file.key,
        })
        await media.save()
        const mediaJSON = media.toJSON()
        const signedUrl = await getSignedUrl(media)
        mediaJSON.link = signedUrl
        return res.json(mediaJSON)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
})
