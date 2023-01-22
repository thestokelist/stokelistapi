const { Sequelize } = require('sequelize')

let sequelize
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    })
    console.log(
        'New postgres database connection initialized from DATABASE_URL on Heroku'
    )
}
module.exports = sequelize
