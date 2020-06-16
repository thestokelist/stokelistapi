const app = require('./app')
const port = process.env.PORT || 3010

app.listen(port, () => console.log(`Stoke List API listening on port ${port}!`))
