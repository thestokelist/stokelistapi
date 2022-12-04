exports.removeUnusedUploads = async () => {
    const Media = require('../models/media')
    await Media.removeUnusedUploads()
}
