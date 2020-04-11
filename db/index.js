const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')
dotenv.config()

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: true,
    native: true,
    dialectOptions: {
        ssl: 'require'
    }
  });
module.exports = sequelize