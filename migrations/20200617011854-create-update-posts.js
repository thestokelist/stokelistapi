'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        //This will run CREATE TABLE IF NOT EXISTS, so if we have an existing table
        //nothing will happen
        await queryInterface.createTable('posts', {
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
            photoFileName: {
                type: Sequelize.STRING,
                field: 'photo_file_name',
            },
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

        //Now we add the columns, in case we were dealing with a legacy posts table
        const updatePromises = []
        const tableDefinition = await queryInterface.describeTable('posts')
        if (!tableDefinition.exactLocation) {
            updatePromises.push(
                queryInterface.addColumn('posts', 'exactLocation', {
                    type: Sequelize.GEOMETRY,
                    field: 'exact_location',
                })
            )
        }
        if (!tableDefinition.isGarageSale) {
            updatePromises.push(
                queryInterface.addColumn('posts', 'isGarageSale', {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    field: 'garage_sale',
                    allowNull: false,
                })
            )
        }
        if (!tableDefinition.moderated) {
            updatePromises.push(
                queryInterface.addColumn('posts', 'moderated', {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                })
            )
        }
        if (!tableDefinition.startTime) {
            updatePromises.push(
                queryInterface.addColumn('posts', 'startTime', {
                    type: Sequelize.DATE,
                    field: 'start_time',
                })
            )
        }
        if (!tableDefinition.endTime) {
            updatePromises.push(
                queryInterface.addColumn('posts', 'endTime', {
                    type: Sequelize.DATE,
                    field: 'end_time',
                })
            )
        }
        return updatePromises
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('posts')
    },
}
