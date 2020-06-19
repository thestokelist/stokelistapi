const Router = require('express-promise-router')
const Media = require('../models/media')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { v4 } = require('uuid')
require('dotenv').config()

const router = new Router()
module.exports = router

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
})
const s3 = new AWS.S3()

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        key: function (req, file, cb) {
            console.log(file)
            const newUUID = v4()
            const extension = file.originalname.split('.').pop()
            cb(null, `${newUUID}.${extension}`)
        },
    }),
}).single('media')

//Upload an attachment
router.post('/', upload, async (req, res) => {
    console.log(`Creating new post attachment`)
    try {
        //Get the contents off the wire
        //Dump them in S3
        //return an object to the user
        const file = req.file
        const newMedia = {
            link: file.location,
            name: file.originalname,
            type: file.mimetype,
        }
        const media = new Media(newMedia)
        await media.save()
        return res.json(media)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
})
