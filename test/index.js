const initDatabase = async () => {
    const Post = require('../models/post')
    const User = require('../models/user')
    const Report = require('../models/report')
    const Media = require('../models/media')
    await Post.sync({ alter: true })
    await User.sync({ alter: true })
    await Report.sync({ alter: true })
    await Media.sync({ alter: true })
}

exports.initSupertestWithMocks = async () => {
    //Auto-mock mail so we don't actually send out emails - no implementation
    jest.mock('../mail')
    //Mock database to use sqlite:inmemory - implementation in __mocks__
    jest.mock('../db')
    //Do the regular requires

    const app = require('../app.js')
    const supertest = require('supertest')

    //Initialize supertest
    const request = supertest(app)
    await initDatabase()
    return request
}

exports.getPostFuzzer = () => {
    const fuzzer = require('fuzzer')
    const originalInput = {
        title: 'Test',
        description: 'Description',
        price: '150',
        email: 'foo@bar.com',
    }
    fuzzer.seed(1000)
    const fuzzGen = fuzzer.mutate.object(originalInput)
    return fuzzGen
}
