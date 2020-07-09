require('dotenv').config()
const express = require('express')
const cron = require('node-cron')
const mountRoutes = require('./routes')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const passport = require('passport')
const { strategy } = require('./auth')
const { removeUnusedUploads, processNewEmails } = require('./util/scheduled')

cron.schedule('*/10 * * * *', function () {
    console.log('Checking for new emails to process, every 10 minutes')
    processNewEmails()
})

cron.schedule('0 * * * *', function () {
    console.log('Clearing unused uploads, on the hour')
    removeUnusedUploads()
})

var corsOptions = {
    //Can't use credentials with a wildcard include, but can use this 'wildcard' origin function
    origin: (origin, callback) => {
        callback(null, true)
    },
    credentials: true,
}

const app = express()

//JSON parsing for POST requests
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Use CORS
app.use(cors(corsOptions))

//Helmet for security related protections
app.use(helmet())

//Passport for JWT based authentication
passport.use(strategy)
app.use(passport.initialize())

//This makes sure express gives us a real IP address
app.enable('trust proxy')

mountRoutes(app)

//Export only needed for testing
module.exports = app
