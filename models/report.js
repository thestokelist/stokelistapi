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
        remoteIp: { type: DataTypes.STRING, field: 'remote_ip' },
    },
    {
        sequelize,
        modelName: 'Report',
        tableName: 'reports',
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
)

Report.prototype.toJSON = function () {
    var values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deleted_at
    delete values.remoteIp
    return values
}

module.exports = Report
