const { StaticPool } = require("node-worker-threads-pool");

module.exports = {
    /**
     * Get hamming distance
     * @param {string} phash1 64 bits perceptual hash
     * @param {string} phash2 64 bits perceptual hash
     * @returns {number} a number between 0 and 1, where 0 means the two images are perceived to be identical
     */
    distance(phash1, phash2) {
        let count = 0;
        for (let i = 0; i < phash1.length; i++) {
            if (phash1[i] !== phash2[i]) {
                count++;
            }
        }
        return count / 64;
    },
    async phash(image) {
        const staticPool = new StaticPool({
            size: 1,
            task: (buf) => {
                const { workerData } = require("worker_threads");

                const buffer = Buffer.from(
                    buf,
                    workerData.offset,
                    workerData.length
                );

                // Reference: https://github.com/btd/sharp-phash

                const SAMPLE_SIZE = 32;

                function initSQRT(N) {
                    const c = new Array(N);
                    for (let i = 1; i < N; i++) {
                        c[i] = 1;
                    }
                    c[0] = 1 / Math.sqrt(2.0);
                    return c;
                }

                const SQRT = initSQRT(SAMPLE_SIZE);

                function initCOS(N) {
                    const cosines = new Array(N);
                    for (let k = 0; k < N; k++) {
                        cosines[k] = new Array(N);
                        for (let n = 0; n < N; n++) {
                            cosines[k][n] = Math.cos(
                                ((2 * k + 1) / (2.0 * N)) * n * Math.PI
                            );
                        }
                    }
                    return cosines;
                }

                const COS = initCOS(SAMPLE_SIZE);

                function applyDCT(f, size) {
                    var N = size;

                    var F = new Array(N);
                    for (var u = 0; u < N; u++) {
                        F[u] = new Array(N);
                        for (var v = 0; v < N; v++) {
                            var sum = 0;
                            for (var i = 0; i < N; i++) {
                                for (var j = 0; j < N; j++) {
                                    sum += COS[i][u] * COS[j][v] * f[i][j];
                                }
                            }
                            sum *= (SQRT[u] * SQRT[v]) / 4;
                            F[u][v] = sum;
                        }
                    }
                    return F;
                }

                const LOW_SIZE = 8;

                // copy signal
                const s = new Array(SAMPLE_SIZE);
                for (let x = 0; x < SAMPLE_SIZE; x++) {
                    s[x] = new Array(SAMPLE_SIZE);
                    for (let y = 0; y < SAMPLE_SIZE; y++) {
                        s[x][y] = buffer[SAMPLE_SIZE * y + x];
                    }
                }

                // apply 2D DCT II
                const dct = applyDCT(s, SAMPLE_SIZE);

                // get AVG on high frequencies
                let totalSum = 0;
                for (let x = 0; x < LOW_SIZE; x++) {
                    for (let y = 0; y < LOW_SIZE; y++) {
                        totalSum += dct[x + 1][y + 1];
                    }
                }

                const avg = totalSum / (LOW_SIZE * LOW_SIZE);

                // compute hash
                let fingerprint = "";

                for (let x = 0; x < LOW_SIZE; x++) {
                    for (let y = 0; y < LOW_SIZE; y++) {
                        fingerprint += dct[x + 1][y + 1] > avg ? "1" : "0";
                    }
                }

                return fingerprint;
            },
            workerData: {
                offset: image.byteOffset,
                length: image.byteLength,
            },
        });

        const phash = await staticPool
            .createExecutor()
            .setTransferList([image.buffer])
            .exec(image);

        staticPool.destroy();

        return phash;
    },
};
