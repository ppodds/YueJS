const { Collection } = require("discord.js");
const { Image } = require("../database/models/image");
const AsyncLock = require("async-lock");
const Logger = require("../utils/logger");
const fs = require("fs").promises;
const { isSimilar, makeRegularImage } = require("./imageSimilar");

class ImageManager {
    static images = new Collection();
    static lock = new AsyncLock();
    /**
     * init ImageManager
     */
    static async init() {
        this.images.set("pic", []);
        this.images.set("hpic", []);
        this.images.set("wtfpic", []);
        // TODO load processed images from json
        await this.loadJson();
        await this.loadAll();
    }
    /**
     * Add an regular image data to memory cache.
     * @param {string} type image type
     * @param {Number} imageId image id
     * @param {Buffer} regularImage regular image biniary
     */
    static addImage(type, imageId, regularImage) {
        this.images.get(type).push({ id: imageId, data: regularImage });
    }
    /**
     * Save temp file.
     */
    static async save() {
        await this.lock.acquire("image", () => {
            Logger.info("Saving processed images raw data...");
            this.images.forEach((element) =>
                element.forEach(
                    (imageArray) => (imageArray = JSON.stringify(imageArray))
                )
            );
            fs.writeFile(
                "./temp/imageTmp.json",
                JSON.stringify({
                    pic: this.images.get("pic"),
                    hpic: this.images.get("hpic"),
                    wtfpic: this.images.get("wtfpic"),
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
                await fs.readFile("./temp/imageTmp.json"),
                (key, value) => {
                    return value && value.type === "Buffer"
                        ? Buffer.from(value)
                        : value;
                }
            );
            this.images.set("pic", dataObj.pic);
            this.images.set("hpic", dataObj.hpic);
            this.images.set("wtfpic", dataObj.wtfpic);
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
        Logger.info(`Loading images which type is ${type}...`);
        const dbImageIdList = await Image.findAll({
            where: {
                type: Image.typeInDatabase(type),
            },
            attributes: ["id"],
        });

        // id list of image in cache
        const cacheImageMap = new Collection();
        this.images
            .get(type)
            .forEach((img) => cacheImageMap.set(img.id, img.data));

        if (dbImageIdList.length !== this.images.get(type).length) {
            // this.images.set(type, []);
            const tasks = [];

            // sync with database
            dbImageIdList.forEach((dbImageId) => {
                if (!cacheImageMap.get(dbImageId)) {
                    // load from database
                    tasks.push(
                        new Promise(async (resolve, reject) => {
                            const image = await Image.get(dbImageId.id);
                            this.addImage(
                                type,
                                dbImageId.id,
                                await makeRegularImage(image.image)
                            );
                            Logger.info(`${image.id}.${image.ext} loaded!`);
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
     * @param {Buffer} regularImage regular image binary
     * @returns {Promise<boolean>} if the picture is already in the database
     */
    static async inDatabase(type, regularImage) {
        for (const dbimg of this.images.get(type)) {
            if (await isSimilar(dbimg.data, regularImage)) return true;
        }
        return false;
    }
}

module.exports = ImageManager;
