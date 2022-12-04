const removeUnusedUploads = async () => {
    const Media = require('../models/media')
    await Media.removeUnusedUploads()
}

removeUnusedUploads()
