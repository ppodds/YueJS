const { Model, DataTypes } = require("sequelize");

class Image extends Model {
    static allowType = ["pic", "hpic", "wtfpic"];
    /**
     * Add a image to db
     * @param {string} type pic, hpic, wtfpic
     * @param {string} uploader uploader user id
     * @param {string} ext image's extension
     * @param {ArrayBuffer} data image's binary data
     */
    static async add(type, uploader, ext, data) {
        if (!this.allowType.includes(type)) throw new Error("type not support");

        return await Image.create({
            type: this.typeInDatabase(type),
            uploader: uploader,
            ext: ext,
            image: data,
        });
    }
    /**
     * Get an Image by id
     * @param {Number} id Image's id
     * @returns {Promise<Image>} an Image object contains all infomation
     */
    static async get(id) {
        return await Image.findOne({
            where: {
                id: id,
            },
        });
    }

    /**
     * Get an random image with according type
     * @param {string} type image type
     * @returns {Promise<Image>} a random image
     */
    static async random(type) {
        const dbImageIdList = await Image.findAll({
            where: {
                type: Image.typeInDatabase(type),
            },
            attributes: ["id"],
        });
        const randId =
            dbImageIdList[Math.floor(Math.random() * dbImageIdList.length)];

        return randId ? await Image.get(randId.id) : null;
    }

    // TODO I need an enum QAQ

    /**
     * Convert type to database store number
     * @param {string} type pic, hpic, wtfpic
     */
    static typeInDatabase(type) {
        switch (type) {
            case "pic":
                return 0;
            case "hpic":
                return 1;
            case "wtfpic":
                return 2;
            default:
                throw new Error("type not support");
        }
    }
    /**
     * Convert database store number to type string
     * @param {number} type
     */
    static typeToString(type) {
        switch (type) {
            case 0:
                return "pic";
            case 1:
                return "hpic";
            case 2:
                return "wtfpic";
            default:
                throw new Error("type not support");
        }
    }
}

module.exports = {
    Image: Image,
    init(sequelize) {
        this.instance = Image.init(
            {
                type: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                uploader: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                ext: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                image: {
                    type: DataTypes.BLOB("long"),
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
