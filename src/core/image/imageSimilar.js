const { distance, phash } = require("./phash");
const { StaticPool } = require("node-worker-threads-pool");
const sharp = require("sharp");

module.exports = {
    /**
     * Check if the two pictures are similar
     * @param {string} phash1 image1's phash
     * @param {string} phash2 image2's phash
     * @returns {boolean} if the two pictures are similar
     */
    isSimilar(phash1, phash2) {
        if (phash1 == null || phash2 == null) return false;
        const LEVEL = 0.2;
        return distance(phash1, phash2) < LEVEL;
    },
};
