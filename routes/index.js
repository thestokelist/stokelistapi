//Import other controllers
const posts = require('./posts')
const db = require('./db')

module.exports = app => {
  app.use('/posts', posts)
  app.use('/', db)
}