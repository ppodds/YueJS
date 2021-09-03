module.exports = {
    toDatetimeString(time) {
        return time.toISOString().substring(0, 19).replace("T", " ");
    },
};
