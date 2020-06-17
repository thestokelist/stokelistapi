const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')
dotenv.config()
const pg = require('pg')

//default true
const ssl = process.env.DB_SSL === undefined ? true : process.env.DB_SSL

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: ssl,
    native: ssl,
    dialectModule: pg,
    dialectOptions: {
        ssl: ssl ? undefined : 'require',
    },
})
console.log('New postgres database connection initialized')

module.exports = sequelize
