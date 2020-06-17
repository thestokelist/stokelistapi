'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('posts', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            price: {
                type: Sequelize.STRING,
            },
            location: { type: Sequelize.STRING },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            //TODO: Need to handle these next 3 at the same time as attachment upload
            photoFileName: { type: Sequelize.STRING, field: 'photo_file_name' },
            photoContentType: {
                type: Sequelize.STRING,
                field: 'photo_content_type',
            },
            photoFileSize: {
                type: Sequelize.INTEGER,
                field: 'photo_file_size',
            },
            guid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
            sticky: { type: Sequelize.BOOLEAN, defaultValue: false },
            emailVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                field: 'email_verified',
            },
            remoteIp: { type: Sequelize.STRING, field: 'remote_ip' },
            //New fields added 2020
            exactLocation: {
                type: Sequelize.GEOMETRY,
                field: 'exact_location',
            },
            isGarageSale: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                field: 'garage_sale',
                allowNull: false,
            },
            moderated: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            startTime: {
                type: Sequelize.DATE,
                field: 'start_time',
            },
            endTime: {
                type: Sequelize.DATE,
                field: 'end_time',
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
        return queryInterface.dropTable('posts')
    },
}
