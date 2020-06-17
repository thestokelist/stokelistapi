'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('reports', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            reason: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            comment: {
                type: Sequelize.STRING,
            },
            remoteIp: {
                type: Sequelize.STRING,
                field: 'remote_ip',
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
        return queryInterface.dropTable('reports')
    },
}
