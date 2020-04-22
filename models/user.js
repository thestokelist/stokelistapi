const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = require('../db')

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
        secret: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        loginToken: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'login_token',
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

module.exports = User
