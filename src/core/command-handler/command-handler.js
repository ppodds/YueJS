const fs = require("fs");
const { Collection } = require("discord.js");

const commands = new Collection();

const commandFolders = fs.readdirSync("./src/core/command-handler/commands");
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./src/core/command-handler/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        commands.set(command.data.name, command);
    }
}

module.exports = commands;
