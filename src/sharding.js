const { ShardingManager } = require("discord.js");
const { token } = require("./config/bot-config.json");
const Logger = require("./core/utils/logger");

const manager = new ShardingManager("./src/bot.js", {
    token: token,
});

manager.on("shardCreate", (shard) => Logger.info(`Launched shard ${shard.id}`));
manager.spawn();
