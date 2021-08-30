const launchTimestamp = Date.now();

const { Client, Intents } = require("discord.js");
const Logger = require("./core/utils/logger");
const eventManager = require("./core/event-handler/event-handler");
const dbManager = require("./core/database/manager");
const { token } = require("./config/bot-config.json");

// Create the Discord client with the appropriate options
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Init event manager
eventManager.init(client, { launchTimestamp });

// Init database manager
dbManager.init();

client
    .login(token)
    .then(() => Logger.info("Logged into Discord successfully"))
    .catch((err) => {
        Logger.error("Error logging into Discord", err);
        process.exit();
    });
