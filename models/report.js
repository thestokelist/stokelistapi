const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db')

class Report extends Model {}

Report.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [0, 10],
            },
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        remoteIp: { type: DataTypes.STRING, allowNull: false },
    },
    {
        underscored: true,
        sequelize,
        modelName: 'Report',
        tableName: 'reports',
        paranoid: true,
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)


module.exports = Report
