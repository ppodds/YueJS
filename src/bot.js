const launchTimestamp = Date.now();

const { Client, Intents } = require("discord.js");
const Logger = require("./core/utils/logger");
const eventManager = require("./core/event-handler/event-handler");
const dbManager = require("./core/database/manager");
const { token } = require("./config/bot-config.json");

// Create the Discord client with the appropriate options
const client = new Client({
    // IMPORTANT: you should set it or your bot can't get the information of Discord
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    // if you CHANNEL not enable, you can't get any event in dm channel
    partials: ["CHANNEL"],
});

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
