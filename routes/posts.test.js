const { initSupertestWithMocks } = require('../test')

let request

beforeAll(async () => {
    //Set up supertest, which sets up all the mocks in Jest
    request = await initSupertestWithMocks()
})

//Smoke tests to make sure our testing framework runs and connects to our application
test('empty GET /posts works', async () => {
    const res = await request.get('/posts')
    expect(res.status).toBe(200)
})

test('empty GET /sticky posts works', async () => {
    const res = await request.get('/posts/sticky')
    expect(res.status).toBe(200)
})

test('empty GET /garage posts works', async () => {
    const res = await request.get('/posts/garage')
    expect(res.status).toBe(200)
})

test('POST /posts fails with validation error (422) with no body', async () => {
    const res = await request.post('/posts')
    expect(res.status).toBe(422)
})

test('DELETE /posts fails 404', async () => {
    const res = await request.delete('/posts')
    expect(res.status).toBe(404)
})

test('DELETE /posts/1 with no authentication fails 401', async () => {
    const res = await request.delete('/posts/1')
    expect(res.status).toBe(401)
})
