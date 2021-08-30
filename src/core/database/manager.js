const { Sequelize } = require("sequelize");
const dbConfig = require("../../config/db-config.json");
const { env } = require("../../config/bot-config.json");
const Logger = require("../utils/logger");
const user = require("./models/user");
const grab = require("./models/grab");
const image = require("./models/image");
const reply = require("./models/reply");

let loggingSetting;

// logger setting
if (env === "prod") {
    loggingSetting = false;
} else {
    loggingSetting = (...msg) => Logger.info(msg);
}

module.exports = {
    async init() {
        const sequelize = new Sequelize(
            dbConfig.database,
            dbConfig.user,
            dbConfig.password,
            {
                host: dbConfig.host,
                dialect: "mariadb",
                timezone: "+08:00",
                logging: loggingSetting,
            }
        );
        user.init(sequelize);
        grab.init(sequelize);
        image.init(sequelize);
        reply.init(sequelize);

        await sequelize.sync();
        Logger.info("資料庫系統檢查完畢");
    },
};
