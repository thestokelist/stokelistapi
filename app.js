// ./app.js
const express = require('express')
const mountRoutes = require('./routes')
const bodyParser = require('body-parser');
const cors = require('cors')

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

app.use(cors(corsOptions))

mountRoutes(app)

//Export only needed for testing
module.exports = app