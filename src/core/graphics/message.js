const { Channel } = require("discord.js");

module.exports = {
    /**
     * Send a message to text channel and delete it after delay
     * @param {Channel} channel the channel where you want to send message
     * @param {string} content message content
     * @param {number} deleteAfter delete delay (ms)
     */
    async send(channel, content, deleteAfter = 0) {
        const message = await channel.send(content);
        if (deleteAfter < 0) throw new Error("only accept number > 0");
        else if (deleteAfter === 0) return;
        setTimeout(async () => await message.delete(), deleteAfter);
    },
};
