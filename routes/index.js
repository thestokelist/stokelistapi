//Import other controllers
const posts = require('./posts')
const users = require('./login')
const admin = require('./admin')
const report = require('./report')
const upload = require('./upload')

module.exports = (app) => {
    app.use('/login', users)
    app.use('/posts', posts)
    app.use('/admin', admin)
    app.use('/report', report)
    app.use('/upload', upload)
}
