const { DataTypes, Model, Op } = require('sequelize')
const sequelize = require('../db')
const Post = require('./post')
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

Post.hasMany(Media, { foreignKey: 'post_id', allowNull: false, as: 'media' })
Media.belongsTo(Post, { foreignKey: 'post_id', as: 'post' })

Media.removeUnusedUploads = async () => {
    const twoHours = twoHoursAgo()
    //An unused upload has a non-null guid, but was created more than 2 hours ago
    //ie, it was uploaded then never assigned to a post
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
        console.log(`Destroying unused media with id ${media.id}`)
        media.destroy()
    })
    //A deleted media belongs to a post that was deleted more than 2 hours ago
    //We don't delete immediately, because we want to allow the user to undelete
    const deletedMedia = await Media.findAll({
        include: [
            {
                model: Post,
                as: 'post',
                required: true,
                paranoid: false,
                where: {
                    deleted_at: {
                        [Op.lt]: twoHours,
                    },
                },
            },
        ],
    })
    deletedMedia.forEach((media) => {
        console.log(`Desroying deleted media with id ${media.id}`)
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

Media.prototype.publish = async function () {
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
    return mediaJSON
}

Media.assign = async (media, post) => {
    await Media.update(
        {
            name: media.name || '',
            post_id: post.id,
            guid: null,
        },
        { where: { guid: media.guid } }
    )
}
module.exports = Media
