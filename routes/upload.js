const Router = require('express-promise-router')
const addRequestId = require('express-request-id')()
const multer = require('multer')
const sharp = require('sharp')
const Media = require('../models/media')

const storage = multer.memoryStorage()
const uploadMiddleware = multer({ storage: storage })
const router = new Router()
const { upload } = require('../util/s3')

module.exports = router

//Upload an attachment
router.post(
    '/',
    addRequestId,
    uploadMiddleware.single('media'),
    async (req, res) => {
        console.log(`Creating new post attachment`)
        try {
            //upload middleware has done the s3 upload, req.file is the response
            //TOOD: acl: private
            const file = req.file
            const input = file.buffer
            const original = await sharp(input)
                .rotate()
                .resize(1920, 1080, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true,
                })
                .toBuffer()
            const thumbnail = await sharp(input)
                .rotate()
                .resize({ height: 120 })
                .toBuffer()
            const extension = file.originalname.split('.').pop()
            const filename = `${req.id}.${extension}`
            const thumbFilename = `${req.id}-thumb.${extension}`
            await upload(
                original,
                thumbnail,
                filename,
                thumbFilename,
                file.mimetype
            )
            const media = new Media({
                thumb: thumbFilename,
                name: '',
                type: file.mimetype,
                key: filename,
            })
            await media.save()
            const mediaJSON = await media.toJSONSigned()
            return res.json(mediaJSON)
        } catch (e) {
            console.log(e)
            return res.sendStatus(500)
        }
    }
)
