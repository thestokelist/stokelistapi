const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db')
const User = require('./user')

class Post extends Model {}

const isntTooYellyWithTheCaps = (string) => {
    const upperCaseCount = string.replace(/[^A-Z]/g, '').length
    const lowerCaseCount = string.replace(/[^a-z]/g, '').length
    if (upperCaseCount > 0 && upperCaseCount > lowerCaseCount) {
        throw new Error(`You're yelling`)
    }
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [0, 45],
                isntTooYellyWithTheCaps: isntTooYellyWithTheCaps,
            },
        },
        price: {
            type: DataTypes.STRING
        },
        location: { type: DataTypes.STRING },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            isntTooYellyWithTheCaps: isntTooYellyWithTheCaps,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        //TODO: Need to handle these next 3 at the same time as attachment upload
        photoFileName: { type: DataTypes.STRING, field: 'photo_file_name' },
        photoContentType: {
            type: DataTypes.STRING,
            field: 'photo_content_type',
        },
        photoFileSize: { type: DataTypes.INTEGER, field: 'photo_file_size' },
        guid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        sticky: { type: DataTypes.BOOLEAN, defaultValue: false },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'email_verified',
        },
        remoteIp: { type: DataTypes.STRING, field: 'remote_ip' },
        //New fields added 2020
        exactLocation: { type: DataTypes.GEOMETRY, field: 'exact_location' },
        isGarageSale: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'garage_sale',
            allowNull: false,
        },
        //Ignored columns that appear not to be used/used anymore:
        // price_in_cents, computed_tags, originating_country/region/lat_lng
        // is_awesome, is_idiotic, tags
        startTime: {
            type: DataTypes.DATE,
            field: 'start_time',
        },
        endTime: {
            type: DataTypes.DATE,
            field: 'end_time',
        },
        //Ignored columns that appear not to be used/used anymore:
        // price_in_cents, computed_tags, originating_country/region/lat_lng
        // is_awesome, is_idiotic, tags
    },
    {
        sequelize,
        modelName: 'Post',
        tableName: 'posts',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at',
    }
)

Post.afterCreate(async (post, options) => {
    await User.findOrCreate({
        where: {
            email: post.email,
        },
    })
})

module.exports = Post
