const { MessageEmbed } = require("discord.js");
const colors = require("./colors");
const { author } = require("../../config/bot-config.json");

module.exports = {
    info(client, description, color) {
        return new MessageEmbed()
            .setColor(color || colors.primary)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author.avatar);
    },

    warn(description) {
        return new MessageEmbed()
            .setColor(colors.warn)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author);
    },

    error(description) {
        return new MessageEmbed()
            .setColor(colors.error)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author);
    },
};
