const { DataTypes, Model } = require('sequelize')
const sequelize = require('../db')

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

Media.prototype.toJSON = function () {
    var values = Object.assign({}, this.get())
    //Remove fields the client doesn't need from the JSON response
    delete values.deleted_at
    return values
}
module.exports = Media
