const { Pool } = require('pg')
const dotenv = require('dotenv')
dotenv.config()

const pool = new Pool({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    max: 20,
  })

module.exports = {
  query: (text, params) => pool.query(text, params),
}