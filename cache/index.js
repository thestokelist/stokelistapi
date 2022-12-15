//const NodeCache = require('node-cache')
/*const postCache = new NodeCache({
    stdTTL: 30000,
    checkPeriod: 600,
})*/

const cache = {}

cache.put = (id, data) => {
    //postCache.set(id, data)
}
cache.get = (id) => {
    return undefined;
    //return postCache.get(id)
}
cache.del = (id) => {
    //postCache.del(id)
}
cache.regenLatest = () => {
    // Rather than regenerate, we just delete it from the cache
    // and let the next request repopulate the cache
    //postCache.del('latest')
}

module.exports = cache
