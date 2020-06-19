require('dotenv').config()

let username = process.env.DB_USER
let password = process.env.DB_PASS
let database = process.env.DB_NAME
let host = process.env.DB_HOST

if (process.env.DATABASE_URL) {
    const relevantUrl = process.env.DATABASE_URL.split('://')[1]
    //On heroku, so override with heroku settings
    username = relevantUrl.split(':')[0]
    let passwordHost = relevantUrl.split(':')[1]
    let portDatabase = relevantUrl.split(':')[2]
    password = passwordHost.split('@')[0]
    host = passwordHost.split('@')[1]
    database = portDatabase.split('/')[1]
}

module.exports = {
    development: {
        username,
        password,
        database,
        host,
        dialect: 'postgres',
    },
    //Production uses same env variables as development
    production: {
        username,
        password,
        database,
        host,
        dialect: 'postgres',
    },
}
