const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = require('../db')
const { createToken } = require('../util/crypto')
const Post = require('./post')

class User extends Model {}

User.init(
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            validate: {
                isEmail: true,
            },
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'approved_at',
        },
        bannedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'banned_at',
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_admin',
        },
        loginToken: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'login_token',
        },
        tokenValidity: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        underscored: true,
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

User.prototype.generateToken = function () {
    const token = createToken(this.email,this.isAdmin)
    return token
}

User.prototype.toJSON = function () {
    var values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deletedAt
    delete values.tokenValidity
    return values
}

module.exports = User
