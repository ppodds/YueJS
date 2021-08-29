const launchTimestamp = Date.now();

const { Client, Intents, Collection } = require("discord.js");
const Logger = require("./core/utils/logger");
const eventManager = require("./core/event-handler/event-handler");
const { token } = require("./config/bot-config.json");

// Create the Discord client with the appropriate options
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Init event manager
eventManager.init(client, { launchTimestamp });

client
    .login(token)
    .then(() => Logger.info("Logged into Discord successfully"))
    .catch((err) => {
        Logger.error("Error logging into Discord", err);
        process.exit();
    });
