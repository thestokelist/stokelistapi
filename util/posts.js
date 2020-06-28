exports.trimPostDescriptions = (postsToTrim) => {
    let trimmedPosts = []
    for (const post of postsToTrim) {
        const postJSON = post.toJSON()
        if (postJSON.description.length > 143) {
            let words = postJSON.description.split(' ')
            let trimmedDescription = ''
            for (const word of words) {
                trimmedDescription += word + ' '
                if (trimmedDescription.length > 140) {
                    trimmedDescription += '...'
                    break
                }
            }
            postJSON.description = trimmedDescription.replace(/\r?\n|\r/g, '  ')
        }
        trimmedPosts.push(postJSON)
    }
    return trimmedPosts
}
