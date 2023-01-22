const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    PutObjectAclCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const bucketName = process.env.AWS_S3_BUCKET

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

exports.upload = async (
    original,
    thumbnail,
    originalName,
    thumbName,
    contentType
) => {
    const originalParams = {
        Bucket: bucketName,
        Body: original,
        Key: originalName,
        ContentType: contentType,
    }
    const thumbnailParams = {
        Bucket: bucketName,
        Body: thumbnail,
        Key: thumbName,
        ContentType: contentType,
    }
    await s3Client.send(new PutObjectCommand(originalParams))
    await s3Client.send(new PutObjectCommand(thumbnailParams))
}

exports.getSignedUrl = async (key) => {
    const signedUrlExpireSeconds = 60 * 60
    const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        }),
        { expiresIn: signedUrlExpireSeconds } //
    )
    return url
}

exports.deleteS3Object = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    }
    try {
        await s3Client.send(new DeleteObjectCommand(params))
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
        await s3Client.send(new PutObjectAclCommand(params))
        console.log(`Updated ACL for key ${key} to ${acl}`)
    } catch (err) {
        console.log(`Error updating ACL for key ${key} to ${acl}`)
    }
}

exports.getImgUrl = () => {
    return process.env.IMG_URL
}
