exports.trimPostDescriptions = (postsToTrim) => {
    let trimmedPosts = []
    for (const post of postsToTrim) {
        const postJSON = post.toJSON()
        if (postJSON.description.length > 243) {
            let words = postJSON.description.split(' ')
            let trimmedDescription = ''
            for (const word of words) {
                trimmedDescription += word + ' '
                if (trimmedDescription.length > 240) {
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
