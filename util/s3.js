const AWS = require('aws-sdk')
const multer = require('multer')
const s3Storage = require('multer-sharp-s3')

const bucketName = process.env.AWS_S3_BUCKET

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    signatureVersion: 'v4',
    region: 'ca-central-1',
})

const s3 = new AWS.S3()

const upload = s3Storage({
    s3,
    Bucket: bucketName,
    ACL: 'private',
    Key: (req, file, cb) => {
        const extension = file.originalname.split('.').pop()
        cb(null, `${req.id}.${extension}`)
    },
    multiple: true,
    resize: [{ suffix: 'thumb', height: 120 }, { suffix: 'original' }],
})
exports.uploadMiddleware = multer({ storage: upload }).single('media')

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
