const LRU = require('lru-cache')

const options = {
    max: 500,
    // how long to live in ms
    //Signed image URL's expire after 60 minutes, so expire then
    ttl: 1000 * 60 * 60,
    // return stale items before removing from cache?
    allowStale: false,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
}

const postCache = new LRU(options)

const cache = {}

cache.put = (id, data) => {
    postCache.set(id, data)
}
cache.get = (id) => {
    return postCache.get(id)
}
cache.del = (id) => {
    postCache.delete(id)
}
cache.regenLatest = () => {
    // Rather than regenerate, we just delete it from the cache
    // and let the next request repopulate the cache
    postCache.delete('latest')
}

module.exports = cache
