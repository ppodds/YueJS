module.exports = {
    toDatetimeString(time) {
        time.setHours(time.getHours() + 8);
        return time.toISOString().substring(0, 19).replace("T", " ");
    },
};
