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
                field: 'banned_at',
            },
            isAdmin: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                field: 'is_admin',
            },
            loginToken: {
                type: Sequelize.UUID,
                field: 'login_token',
            },
            tokenValidity: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'token_validity',
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
        return queryInterface.dropTable('users')
    },
}
