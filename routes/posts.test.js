const app = require('../app.js')
const supertest = require('supertest')
const request = supertest(app)
const sequelize = require('../db')

//Smoke tests to make sure our testing framework runs and connects to our application
it('GET /posts works', async (done) => {
    const res = await request.get('/posts')
    await expect(res.status).toBe(200)
    await expect(res.body.length).toBeGreaterThan(0)
    done()
})

it('POST /posts fails with validation error (422) with no body', async (done) => {
    const res = await request.post('/posts')
    await expect(res.status).toBe(422)
    done()
})

it('DELETE /posts fails 404', async (done) => {
    const res = await request.delete('/posts')
    await expect(res.status).toBe(404)
    done()
})


it('DELETE /posts/1 with no authentication fails 403', async (done) => {
    const res = await request.delete('/posts/1')
    await expect(res.status).toBe(403)
    done()
})

afterAll(async (done) => {
    //Need to stop  sequelize server otherwise Jest complains about async operations that weren't stopped
    await sequelize.close()
    done();
  });