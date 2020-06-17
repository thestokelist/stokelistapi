'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            bannedAt: {
                type: Sequelize.DATE,
            },
            isAdmin: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            loginToken: {
                type: Sequelize.UUID,
            },
            tokenValidity: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
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
        return queryInterface.dropTable('users')
    },
}
