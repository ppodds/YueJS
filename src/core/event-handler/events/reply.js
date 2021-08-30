const { Reply } = require("../../database/models/reply");
const Logger = require("../../utils/logger");
const { author } = require("../../../config/bot-config.json");
const { Collection } = require("discord.js");

const cooldown = new Collection();

/**
 * Send reply to user (it would check cooldown and auto reset)
 * @param {Message} message Message object from event
 * @param {String} response reply's response
 */
async function sendReply(message, reply) {
    if (
        cooldown.get(message.guild.id) === undefined ||
        cooldown.get(message.guild.id)
    ) {
        cooldown.set(message.guild.id, false);
        // 30s cooldown
        setTimeout(() => cooldown.set(message.guild.id, true), 30000);
        await message.channel.sendTyping();
        await message.channel.send(reply.response);
    } else if (message.author.id === author.id) {
        await message.channel.sendTyping();
        await message.channel.send(reply.response);
    }
}

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        // TODO formatted message response
        if (message.guild !== null) {
            let reply, globalReply, formattedReply;
            [reply, globalReply, formattedReply] = await Promise.all([
                Reply.getResponse(
                    message.content,
                    message.guildId,
                    false,
                    false
                ),
                Reply.getResponse(
                    message.content,
                    message.author.id,
                    true,
                    false
                ),
                // Reply.getResponse(message.content, message.guildId, false, true)
            ]);

            Logger.info(
                `${message.guild.name}-${message.channel.name}-${message.author.username}: ${message.content}`
            );

            // 對話反應內容
            if (globalReply !== null) await sendReply(message, globalReply);
            else if (reply !== null) await sendReply(message, reply);

            // TODO 增加rpg經驗值
        } else {
            // in dm channel
            let globalReply, formattedReply;
            [globalReply, formattedReply] = await Promise.all([
                Reply.getResponse(
                    message.content,
                    message.author.id,
                    true,
                    false
                ),
                // Reply.getResponse(message.content, message.guildId, true, true)
            ]);
            // 對話反應內容
            if (globalReply !== null) {
                await message.channel.sendTyping();
                await message.channel.send(globalReply.response);
            }
        }
    },
};
