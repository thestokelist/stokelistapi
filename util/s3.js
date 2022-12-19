const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3-transform')
const sharp = require('sharp')

const bucketName = process.env.AWS_S3_BUCKET

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    signatureVersion: 'v4',
    region: 'ca-central-1',
})

const s3 = new AWS.S3()
const sharpInstance = sharp()

//This middleware requires express-request-id
exports.uploadMiddleware = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        acl: 'private',
        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype))
        },
        transforms: [
            {
                id: 'original',
                key: function (req, file, cb) {
                    const extension = file.originalname.split('.').pop()
                    cb(null, `${req.id}.${extension}`)
                },
                transform: function (req, file, cb) {
                    cb(null, sharpInstance)
                },
            },
            {
                id: 'thumbnail',
                key: function (req, file, cb) {
                    const extension = file.originalname.split('.').pop()
                    cb(null, `thumb_${req.id}.${extension}`)
                },
                transform: function (req, file, cb) {
                    //Set height to 120, width maintaining aspect ratio
                    cb(null, sharpInstance.resize({ height: 120 }))
                },
            },
        ],
    }),
}).single('media')

exports.getSignedUrl = async (key) => {
    const signedUrlExpireSeconds = 60 * 60

    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: signedUrlExpireSeconds,
    }

    const url = await s3.getSignedUrl('getObject', params)
    return url
}

exports.deleteS3Object = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    }
    try {
        await s3.deleteObject(params).promise()
        console.log(`Deleted object from s3 with key ${key}`)
    } catch (err) {
        console.log(`Failed to delete object from s3 with key ${key}`)
    }
}

exports.updateS3Acl = async (acl, key) => {
    console.log(`Updating ACL for key ${key}`)
    const params = {
        Bucket: bucketName,
        Key: key,
        ACL: acl,
    }
    try {
        await s3.putObjectAcl(params).promise()
        console.log(`Updated ACL for key ${key} to ${acl}`)
    } catch (err) {
        console.log(`Error updating ACL for key ${key} to ${acl}`)
    }
}

exports.getImgUrl = () => {
    return process.env.IMG_URL
}
