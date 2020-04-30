const { initSupertestWithMocks, getPostFuzzer } = require('./test')

let request, Post, fuzzGen

beforeAll(async (done) => {
    //Set up supertest, which sets up all the mocks in Jest
    request = await initSupertestWithMocks()
    //Load this here after the mocks are set up, so it uses our test database
    Post = require('./models/post')
    fuzzGen = getPostFuzzer()
    done()
})

it('Fuzzes POST /posts', async (done) => {
    let successes = 0
    const runs = 1000
    for (let i = 0; i<runs; i++) {
        const fuzz = fuzzGen()
        const res = await request
            .post('/posts')
            .send(fuzz)
        if (res.status === 200) {
            successes++
        } else if (res.status !== 422) {
            console.log(fuzz)
            throw new Error("Unexpected status")
        }
        await expect(res.status).not.toBe(500)
    }
    //Check the number of posts in the database is equal to the number of times the API returned 200
    const posts = await Post.findAll()
    expect(posts.length).toBe(successes)
    console.log(`${successes} successful runs out of ${runs}`)
    done()
    //Long timeout because lots of runs!
}, 20000)

