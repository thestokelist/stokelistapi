'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('media', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            guid: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            thumb: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            postId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'posts',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                field: 'post_id',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
            deletedAt: {
                type: Sequelize.DATE,
                field: 'deleted_at',
            },
        })
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('media')
    },
}
