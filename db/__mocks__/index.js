const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')
console.log('New test sqlite database connection initialized')

module.exports = sequelize
