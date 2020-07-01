const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
require('dotenv').config()
const { v4 } = require('uuid')

const bucketName = process.env.AWS_S3_BUCKET

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    signatureVersion: 'v4',
    region: 'ca-central-1',
})

const s3 = new AWS.S3()

exports.uploadMiddleware = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        acl: 'private',
        key: function (req, file, cb) {
            const newUUID = v4()
            const extension = file.originalname.split('.').pop()
            cb(null, `${newUUID}.${extension}`)
        },
    }),
}).single('media')

exports.getSignedUrl = async (media) => {
    const signedUrlExpireSeconds = 60 * 60

    const params = {
        Bucket: bucketName,
        Key: media.key,
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
        console.log(err, err.stack) // an error occurred
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
