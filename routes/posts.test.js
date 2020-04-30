const { initSupertestWithMocks } = require('../test')

let request

beforeAll(async (done) => {
    //Set up supertest, which sets up all the mocks in Jest
    request = await initSupertestWithMocks()
    done()
})



//Smoke tests to make sure our testing framework runs and connects to our application
it('Empty GET /posts works', async (done) => {
    const res = await request.get('/posts')
    await expect(res.status).toBe(200)
    done()
})

it('Empty GET /sticky posts works', async (done) => {
    const res = await request.get('/posts/sticky')
    await expect(res.status).toBe(200)

    done()
})

it('Empty GET /garage posts works', async (done) => {
    const res = await request.get('/posts/garage')
    await expect(res.status).toBe(200)
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
