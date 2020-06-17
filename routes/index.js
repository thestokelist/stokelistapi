//Import other controllers
const posts = require('./posts')
const users = require('./login')
const admin = require('./admin')

module.exports = (app) => {
    app.use('/login', users)
    app.use('/posts', posts)
    app.use('/admin', admin)
}
