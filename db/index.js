const { Sequelize } = require('sequelize')
const pg = require('pg')

//default true
const ssl = process.env.DB_SSL === undefined ? true : process.env.DB_SSL

let sequelize
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL)
    console.log(
        'New postgres database connection initialized from DATABASE_URL on Heroku'
    )
} else {
    sequelize = new Sequelize({
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
    console.log(
        'New postgres database connection initialized from DB_NAME/USER/PASS/HOST'
    )
}

module.exports = sequelize
