// ./app.js
const express = require('express')
const mountRoutes = require('./routes')
const bodyParser = require('body-parser');
const cors = require('cors')
const helmet = require('helmet')
const passport = require('passport')
const { strategy } = require('./auth')

var corsOptions = {
    //TODO: Be more restrictive with CORS
    //Can't use credentials with a wildcard include, but can use this 'wildcard' origin function
  origin: function (origin, callback) {
      callback(null, true)
  },
  credentials: true
}


const app = express()

//JSON parsing for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Use CORS
app.use(cors(corsOptions))

//Helmet for security related protections
app.use(helmet())

//Passport for JWT based authentication
passport.use(strategy);
app.use(passport.initialize());

mountRoutes(app)

//TODO: Some rate limiting? Perhaps just for login/validation

//Export only needed for testing
module.exports = app