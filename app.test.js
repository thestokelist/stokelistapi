const app = require('./app.js')
const supertest = require('supertest')
const request = supertest(app)
const sequelize = require('./db')

//Smoke tests to make sure our testing framework runs and connects to our application
it('Gets the GET /posts endpoint', async done => {
  const res = await request.get('/posts')
  await expect(res.status).toBe(200)
  await expect(res.body.length).toBeGreaterThan(0)
  done()
})

it('Gets the GET / endpoint to fail', async done => {
  const res = await request.get('/')
  await expect(res.status).toBe(404)
  done()
})

afterAll(async (done) => {
  //Need to stop equalize and express server otherwise Jest complains about async operations that weren't stopped
  await sequelize.close()
  await app.server.close()
  done();
});