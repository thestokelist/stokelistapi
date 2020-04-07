// ./app.js
const express = require('express')
const mountRoutes = require('./routes')
const bodyParser = require('body-parser');
const cors = require('cors')

const port = process.env.PORT || 3010
const app = express()

//JSON parsing for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Enable CORS from all domains for now
app.use(cors())

mountRoutes(app)
app.listen(port, () => console.log(`Stoke List API listening on port ${port}!`))