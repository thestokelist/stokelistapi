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
            },
            postId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'posts',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deletedAt: {
                type: Sequelize.DATE,
            },
        })
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('reports')
    },
}
