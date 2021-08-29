const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, env, dev } = require("./src/config/bot-config.json");
const fs = require("fs");

const commands = [];
const commandFolders = fs.readdirSync("./src/core/command-handler/commands");

const clientId = dev.clientId;
const guildId = dev.guildId;

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./src/core/command-handler/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./src/core/command-handler/commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        if (env === "prod") {
            await rest.put(Routes.applicationCommands(clientId), {
                body: commands,
            });
        } else {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                body: commands,
            });
        }
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
