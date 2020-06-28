const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db')
const { deleteS3Object, updateS3Acl } = require('../util/s3')

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
        link: {
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

Media.beforeDestroy(async (media) => {
    deleteS3Object(media.key)
})

Media.prototype.toJSON = function () {
    let values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deleted_at
    delete values.key
    //Help the client, by using an empty string to represent a null GUID
    if (values.guid === null) {
        values.guid = ''
    }
    return values
}

Media.prototype.publicise = async function () {
    await updateS3Acl('public-read', this.key)
}

Media.prototype.privatize = async function () {
    await updateS3Acl('private', this.key)
}
module.exports = Media
