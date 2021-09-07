const { distance, phash } = require("./phash");
const { StaticPool } = require("node-worker-threads-pool");
const sharp = require("sharp");

module.exports = {
    /**
     * Get a regular image by origin binary
     * @param {Buffer} buffer image binary
     * @returns {Promise<Buffer>} regular image binary
     */
    async makeRegularImage(buffer) {
        const staticPool = new StaticPool({
            size: 1,
            task: async (buf) => {
                const { workerData } = require("worker_threads");
                const sharp = require("sharp");

                const buffer = Buffer.from(
                    buf,
                    workerData.offset,
                    workerData.length
                );

                return await sharp(buffer)
                    .greyscale()
                    .resize(32, 32, { fit: "fill" })
                    .rotate()
                    .raw()
                    .toBuffer();
            },
            workerData: {
                offset: buffer.byteOffset,
                length: buffer.byteLength,
            },
        });

        const regularImage = Buffer.from(
            await staticPool
                .createExecutor()
                .setTransferList([buffer.buffer])
                .exec(buffer)
        );

        staticPool.destroy();

        return regularImage;
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
