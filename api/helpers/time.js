exports.addMinutes = (startTime) => {
    const dateObj = new Date(startTime);
    dateObj.setMinutes(dateObj.getMinutes() + 30);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const date = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const timezoneOffset = startTime.slice(-6);
    const modifiedDateStr = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}${timezoneOffset}`;
    return modifiedDateStr;
};