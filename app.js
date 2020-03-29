// ./app.js
const express = require('express')
const mountRoutes = require('./routes')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 3010

//Enable CORS from all domains for now
app.use(cors())

mountRoutes(app)
app.listen(port, () => console.log(`Stoke List API listening on port ${port}!`))