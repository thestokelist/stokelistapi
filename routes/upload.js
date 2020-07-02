const Router = require('express-promise-router')
const addRequestId = require('express-request-id')()

const Media = require('../models/media')
const { uploadMiddleware } = require('../util/s3')

const router = new Router()
module.exports = router

//Upload an attachment
router.post('/', addRequestId, uploadMiddleware, async (req, res) => {
    console.log(`Creating new post attachment`)
    try {
        //upload middleware has done the s3 upload, req.file is the response
        const file = req.file
        const originalUpload = file.transforms.find((x) => x.id === 'original')
        const thumbnailUpload = file.transforms.find(
            (x) => x.id === 'thumbnail'
        )
        const media = new Media({
            thumb: thumbnailUpload.key,
            name: '',
            type: file.mimetype,
            key: originalUpload.key,
        })
        await media.save()
        const mediaJSON = await media.toJSONSigned()
        return res.json(mediaJSON)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
})
