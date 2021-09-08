const { SlashCommandBuilder } = require("@discordjs/builders");
const ImageManager = require("../../../image/ImageManager");
const Logger = require("../../../utils/logger");
const { Image } = require("../../../database/models/image");
const { ownerOnly, setPermission } = require("../../../utils/permission");
const { Grab } = require("../../../database/models/grab");
const FileType = require("file-type");
const { User } = require("../../../database/models/user");
const { Donor } = require("../../../database/models/donor");
const { phash } = require("../../../image/phash");
const axios = require("axios").default;
const { toDatetimeString } = require("../../../utils/time");

/**
 * Save image to database.
 * @param {Message} message Message object of event.
 * @param {string} type grab type
 * @param {ArrayBuffer} imageData Binary image data.
 */
async function save(message, type, imageData) {
    // get image ext and mime
    const filetype = await FileType.fromBuffer(imageData);
    if (filetype.mime.startsWith("image/")) {
        const imagePhash = await phash(imageData);
        const inDatabase = await ImageManager.inDatabase(type, imagePhash);
        if (inDatabase) return;

        const image = await Image.add(
            type,
            message.author.id,
            filetype.ext,
            imageData
        );
        // update contribution
        const user = await User.get(message.author.id);

        await user.increment("contribution", {
            by: Donor.contributionRatio(type),
        });
        Logger.info(
            `Collect ${image.id}.${image.ext} to ${Image.typeToString(
                image.type
            )} database. author: ${message.author.username}`
        );
        ImageManager.addPhash(type, image.id, imagePhash);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("grab")
        .setDescription("從指定頻道收集圖片進對應的資料庫")
        .addChannelOption((option) =>
            option.setName("channel").setDescription("頻道").setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("type").setDescription("圖片類型").setRequired(true)
        )
        .addIntegerOption((option) =>
            option.setName("range").setDescription("時機範圍")
        ),
    async init(client, name) {
        // This command is owner only
        const permissions = await ownerOnly(client);
        await setPermission(client, name, permissions);
    },
    async execute(interaction) {
        const range = interaction.options.getInteger("range");
        const type = interaction.options.getString("type");
        const channel = interaction.options.getChannel("channel");

        if (!Image.allowType.includes(type))
            return await interaction.reply("這不是我能使用的呢....");

        let grabData = await Grab.findOne({
            where: {
                guild: interaction.guildId,
                channel: channel.id,
            },
        });

        await interaction.deferReply();

        let now = new Date();
        const grabTime = new Date();

        const time = new Date(
            range || grabData
                ? range
                    ? now.setDate(now.getDate() - range)
                    : grabData.time
                : now.setDate(now.getDate() - 10)
        );

        let done = false;
        let before = null;
        let messageCount = 0;
        let imageCount = 0;
        while (!done) {
            const messages = await channel.messages.fetch({
                limit: 100,
                before: before,
            });

            for (const [id, message] of messages) {
                before = id;
                if (message.createdAt < time) {
                    done = true;
                    break;
                }
                messageCount++;
                if (message.author.bot) continue;

                // imgur match
                const imgurResult = message.content.match(
                    /https:\/\/imgur\.com\/([0-9a-zA-Z]+)/
                );

                if (message.attachments.size === 0 && !imgurResult) continue;
                // save image
                if (message.attachments.size !== 0) {
                    // TODO check image raw and download

                    for (const attachmentPair of message.attachments) {
                        const attachment = attachmentPair[1];

                        // get image binarydata
                        const resp = await axios.get(attachment.url, {
                            responseType: "arraybuffer",
                        });

                        await save(message, type, resp.data);
                    }
                } else if (imgurResult) {
                    // get imgur website
                    const resp = await axios.get(imgurResult[0], {
                        responseType: "document",
                    });

                    const re = new RegExp(
                        "https://i.imgur.com/" + imgurResult[1] + ".([0-9a-z]+)"
                    );
                    const imageResult = resp.data.match(re);

                    // get image
                    const imageResp = await axios.get(imageResult[0], {
                        responseType: "arraybuffer",
                    });
                    await save(message, type, imageResp.data);
                }
                imageCount++;
            }

            // no more message!
            if (messages.size !== 100) done = true;
        }
        // update grab time
        if (grabData) {
            grabData.time = grabTime;
            await grabData.save();
        } else
            await Grab.create({
                guild: interaction.guildId,
                channel: channel.id,
                time: grabTime,
            });
        now = new Date();

        await interaction.editReply(
            `Yue從${toDatetimeString(
                new Date(
                    range || grabData
                        ? range
                            ? now.setDate(now.getDate() - range)
                            : grabData.time
                        : now.setDate(now.getDate() - 10)
                )
            )}以來的 ${messageCount} 則訊息中擷取了 ${imageCount} 張圖片，再繼續學習下去很快就會變得厲害了呢....`
        );
    },
};
