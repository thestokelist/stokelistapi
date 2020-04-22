exports.dateWithin24Hours = date => {
    let is24 = false
    if (date) {
        const updatedAt = new Date(date);
        const timeStamp = Math.round(new Date().getTime() / 1000);
        const timeStampYesterday = timeStamp - (24 * 3600);
        is24 = updatedAt >= new Date(timeStampYesterday*1000).getTime();
    }

    return is24
}