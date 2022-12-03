const start = async () => {
    const start = require('./app')
    const app = await start()
    const port = process.env.PORT || 3010

    app.listen(port, () =>
        console.log(`Stoke List API listening on port ${port}!`)
    )
}

start()
