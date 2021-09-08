const Logger = require("../utils/logger");
const { statusList, statusType } = require("../../config/bot-config.json");
const commands = require("../command-handler/command-handler");
const fs = require("fs");

let discordClient;

module.exports = {
    init(client, args = { launchTimestamp: Date.now() }) {
        discordClient = client;
        this.initEssentialEvents(client, args);
        this.initEvents(client);
    },
    initEssentialEvents(
        client = discordClient,
        args = { launchTimestamp: Date.now() }
    ) {
        // Ready event, which gets fired only once when the bot reaches the ready state
        client.once("ready", async () => {
            const updateBotStatus = async () => {
                await client.user.setActivity(
                    statusList[Math.floor(Math.random() * statusList.length)],
                    { type: statusType }
                );
            };

            await updateBotStatus();
            // Updates the bot status every minute
            setInterval(() => updateBotStatus(), 60000);

            // init command permission
            const tasks = [];
            commands.forEach((command, name) => {
                if (command.init) {
                    tasks.push(
                        new Promise(async (resolve, reject) => {
                            await command.init(client, name);
                            resolve();
                        })
                    );
                }
            });
            await Promise.all(tasks);

            Logger.info(
                `Successfully launched in ${
                    (Date.now() - args.launchTimestamp) / 1000
                } seconds!`
            );
        });

        // Slash commands
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isCommand()) return;

            const command = commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                Logger.error("Command threw an error", error);
                await interaction.reply({
                    content: "指令在執行階段出錯了!",
                    ephemeral: true,
                });
            }
        });

        // Some other somewhat important events that the bot should listen to
        client.on("error", (err) =>
            Logger.error("The client threw an error", err)
        );

        client.on("shardError", (err) =>
            Logger.error("A shard threw an error", err)
        );

        client.on("warn", (warn) =>
            Logger.warn("The client received a warning", warn)
        );
    },
    initEvents(client = discordClient) {
        const eventFiles = fs
            .readdirSync("./src/core/event-handler/events")
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.once) {
                client.once(event.name, async (...args) => {
                    try {
                        await event.execute(...args);
                    } catch (error) {
                        Logger.error("Event threw an error", error);
                    }
                });
            } else {
                client.on(event.name, async (...args) => {
                    try {
                        await event.execute(...args);
                    } catch (error) {
                        Logger.error("Event threw an error", error);
                    }
                });
            }
        }
    },
};
