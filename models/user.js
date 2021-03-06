const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = require('../db')
const { createToken } = require('../util/crypto')

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
        bannedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'banned_at',
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
            field: 'token_validity',
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
)

User.prototype.generateToken = function () {
    const token = createToken(this.email, this.isAdmin)
    return token
}

User.prototype.toJSON = function () {
    var values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deleted_at
    delete values.tokenValidity
    delete values.bannedAt
    delete values.loginToken
    return values
}

User.isBanned = async (email) => {
    let [user] = await User.findOrCreate({
        where: {
            email: email,
        },
    })
    return user.bannedAt !== null
}

module.exports = User
