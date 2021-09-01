const sharp = require("sharp");
const { distance, phash } = require("./phash");

module.exports = {
    /**
     * Get a regular image by origin binary
     * @param {Promise<Buffer>} buffer image binary
     */
    async makeRegularImage(buffer) {
        return await sharp(buffer)
            .greyscale()
            .resize(32, 32, { fit: "fill" })
            .rotate()
            .raw()
            .toBuffer();
    },
    /**
     * Check if the two pictures are similar
     * @param {Buffer} regularImage1 regular image binary
     * @param {Buffer} regularImage2 regular image binary
     * @returns {Promise<boolean>} if the two pictures are similar
     */
    async isSimilar(regularImage1, regularImage2) {
        const LEVEL = 0.2;
        // perceptual hash
        [h1, h2] = await Promise.all([
            phash(regularImage1),
            phash(regularImage2),
        ]);
        return distance(h1, h2) < LEVEL;
    },
};
