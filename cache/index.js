const NodeCache = require('node-cache')
const postCache = new NodeCache({
    stdTTL: 300,
    checkPeriod: 10,
})
const cache = {}

cache.put = (id, data) => {
    postCache.set(id, data)
}
cache.get = (id) => {
    return postCache.get(id)
}
cache.del = (id) => {
    postCache.del(id)
}
cache.regenLatest = () => {
    // Rather than regenerate, we just delete it from the cache
    // and let the next request repopulate the cache
    postCache.del('latest')
}

module.exports = cache
