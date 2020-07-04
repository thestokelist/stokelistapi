const { DataTypes, Model, Op } = require('sequelize')
const sequelize = require('../db')
const {
    deleteS3Object,
    updateS3Acl,
    getImgUrl,
    getSignedUrl,
} = require('../util/s3')
const { twoHoursAgo } = require('../util/date')

const imgUrl = getImgUrl()

class Media extends Model {}

Media.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        guid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumb: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        link: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${imgUrl}${this.key}`
            },
            set() {
                throw new Error(`Can't set link`)
            },
        },
        thumbLink: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${imgUrl}${this.thumb}`
            },
            set() {
                throw new Error(`Can't set link`)
            },
        },
    },
    {
        sequelize,
        modelName: 'Media',
        tableName: 'media',
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
)

Media.removeUnusedUploads = async () => {
    const twoHours = twoHoursAgo()
    const unusedUploads = await Media.findAll({
        where: {
            guid: {
                [Op.ne]: null,
            },
            created_at: {
                [Op.lt]: twoHours,
            },
        },
    })
    unusedUploads.forEach((media) => {
        console.log(`Desroying media with id ${media.id}`)
        media.destroy()
    })
}

Media.beforeDestroy(async (media) => {
    //Because the Post is paranoid, this is only run when we explicitly call
    //.destroy on the media, rather than when the post is destroyed
    deleteS3Object(media.key)
    deleteS3Object(media.thumb)
})

Media.prototype.toJSON = function () {
    let values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deleted_at
    //Help the client, by using an empty string to represent a null GUID
    if (values.guid === null) {
        values.guid = ''
    }
    return values
}

Media.prototype.publicise = async function () {
    await updateS3Acl('public-read', this.key)
    await updateS3Acl('public-read', this.thumb)
}

Media.prototype.privatize = async function () {
    await updateS3Acl('private', this.key)
    await updateS3Acl('private', this.thumb)
}

Media.prototype.toJSONSigned = async function () {
    const mediaJSON = this.toJSON()
    const signedUrl = await getSignedUrl(this.key)
    const signedThumbUrl = await getSignedUrl(this.thumb)
    mediaJSON.link = signedUrl
    mediaJSON.thumbLink = signedThumbUrl
    console.log(mediaJSON)
    return mediaJSON
}

module.exports = Media
