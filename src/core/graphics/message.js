const { Channel } = require("discord.js");

module.exports = {
    /**
     * Send a message to text channel and delete it after delay
     * @param {Channel} channel the channel where you want to send message
     * @param {string} content message content
     * @param {number} deleteAfter delete delay (ms)
     */
    async send(channel, content, deleteAfter) {
        const message = await channel.send(content);
        setTimeout(async () => await message.delete(), deleteAfter);
    },
};
