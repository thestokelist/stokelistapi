//Import other controllers
const posts = require('./posts')
const users = require('./login')
const db = require('./db')

module.exports = (app) => {
    app.use('/login', users)
    app.use('/posts', posts)
    app.use('/', db)
}
