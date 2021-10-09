const { Collection } = require("discord.js");
const { Image } = require("../database/models/image");
const AsyncLock = require("async-lock");
const Logger = require("../utils/logger");
const fs = require("fs").promises;
const { isSimilar } = require("./imageSimilar");
const { phash } = require("./phash");

class ImageManager {
    static imagePhashs = new Collection();
    static lock = new AsyncLock();
    /**
     * init ImageManager
     */
    static async init() {
        this.imagePhashs.set("pic", []);
        this.imagePhashs.set("hpic", []);
        this.imagePhashs.set("wtfpic", []);
        // TODO load processed images from json
        await this.loadJson();
        await this.loadAll();
    }
    /**
     * Add a phash data to memory cache.
     * @param {string} type image type
     * @param {Number} imageId image id
     * @param {string} phash phash string
     */
    static addPhash(type, imageId, phash) {
        this.imagePhashs.get(type).push({ id: imageId, data: phash });
    }
    /**
     * Save temp file.
     */
    static async save() {
        await this.lock.acquire("image", () => {
            Logger.info("Saving images phash data...");
            this.imagePhashs.forEach((element) =>
                element.forEach(
                    (imageArray) => (imageArray = JSON.stringify(imageArray))
                )
            );
            fs.writeFile(
                "./temp/imageTmp.json",
                JSON.stringify({
                    pic: this.imagePhashs.get("pic"),
                    hpic: this.imagePhashs.get("hpic"),
                    wtfpic: this.imagePhashs.get("wtfpic"),
                })
            );
            Logger.info("Save successfully!");
        });
    }
    /**
     * Load temp file.
     */
    static async loadJson() {
        try {
            const dataObj = JSON.parse(
                await fs.readFile("./temp/imageTmp.json")
            );
            this.imagePhashs.set("pic", dataObj.pic);
            this.imagePhashs.set("hpic", dataObj.hpic);
            this.imagePhashs.set("wtfpic", dataObj.wtfpic);
        } catch (err) {
            Logger.warn("Failed to read temp file!");
        }
    }
    /**
     * Check if image binaries amount in memory is the same as database, if not, load image form database.
     * @param {string} type image type
     */
    static async load(type) {
        if (!Image.allowType.includes(type))
            throw new Error("type not support");
        Logger.info(`Loading image phashs which type is ${type}...`);
        const dbImageIdList = await Image.findAll({
            where: {
                type: Image.typeInDatabase(type),
            },
            attributes: ["id"],
        });

        // id list of image in cache
        const cachePhashMap = new Collection();
        this.imagePhashs
            .get(type)
            .forEach((phash) => cachePhashMap.set(phash.id, phash.data));

        if (dbImageIdList.length !== this.imagePhashs.get(type).length) {
            const tasks = [];

            // sync with database
            dbImageIdList.forEach((dbImageId) => {
                if (!cachePhashMap.get(dbImageId.id)) {
                    // load from database
                    tasks.push(
                        new Promise(async (resolve, reject) => {
                            const image = await Image.get(dbImageId.id);
                            const data = await phash(image.image);
                            if (data) {
                                this.addPhash(type, dbImageId.id, data);
                                Logger.info(
                                    `${image.id}.${image.ext}'s phash loaded!`
                                );
                            }
                            resolve();
                        })
                    );
                }
            });

            await Promise.all(tasks);
        }
        Logger.info(`type ${type} load complete!`);
    }
    /**
     * load function's wrapper. Check all type of image.
     */
    static async loadAll() {
        Logger.info("Loading image data...");
        await this.lock.acquire("image", async () => {
            await this.load("pic");
            await this.load("hpic");
            await this.load("wtfpic");
        });
        Logger.info("Image data load complete!");
    }
    /**
     * Check if the picture is already in the database
     * @param {string} type image type
     * @param {string} phash image phash
     * @returns {Promise<boolean>} if the picture is already in the database
     */
    static async inDatabase(type, phash) {
        return new Promise((resolve, reject) => {
            for (const imagePhash of this.imagePhashs.get(type)) {
                if (isSimilar(imagePhash.data, phash)) resolve(true);
            }
            resolve(false);
        });
    }
}

module.exports = ImageManager;
