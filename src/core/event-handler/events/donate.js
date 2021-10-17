const { Donor } = require("../../database/models/donor");
const Logger = require("../../utils/logger");
const { Message } = require("discord.js");
const axios = require("axios").default;
const FileType = require("file-type");
const { Image } = require("../../database/models/image");
const { send } = require("../../graphics/message");
const ImageManager = require("../../image/ImageManager");
const { phash } = require("../../image/phash");
const { User } = require("../../database/models/user");

/**
 * Save image to database. It will send hint message to user.
 * @param {Message} message Message object of event.
 * @param {ArrayBuffer} imageData Binary image data.
 * @param {Donor} donor Database Donor object.
 */
async function saveAndSendMessage(message, imageData, donor) {
    // get image ext and mime
    const filetype = await FileType.fromBuffer(imageData);
    if (filetype.mime.startsWith("image/")) {
        const imagePhash = await phash(imageData);
        const inDatabase = await ImageManager.inDatabase(
            donor.type,
            imagePhash
        );
        if (inDatabase)
            // the picture is already in the database
            return await send(message.channel, "Yue已經有這個了....", 20000);

        const image = await Image.add(
            donor.type,
            message.author.id,
            filetype.ext,
            imageData
        );
        await donor.increment("amount", { by: 1 });
        // update contribution
        const user = await User.get(message.author.id);

        await user.increment("contribution", {
            by: Donor.contributionRatio(donor.type),
        });

        await send(message.channel, "已收到! 請繼續上傳!", 5000);
        Logger.info(
            `${message.author.username} uploaded ${image.id}.${image.ext} type: ${image.type}`
        );
        ImageManager.addPhash(donor.type, image.id, imagePhash);
        if (!message.deleted && message.deletable) await message.delete();
    } else {
        await send(message.channel, "這不是我能使用的呢....", 20000);
    }
}

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;

        // imgur match
        const imgurResult = message.content.match(
            /https:\/\/imgur\.com\/([0-9a-zA-Z]+)/
        );

        if (message.attachments.size === 0 && !imgurResult) return;

        const donor = await Donor.findOne({
            where: {
                guild: message.guildId ? message.guildId : "dm",
                channel: message.channelId,
                user: message.author.id,
            },
        });

        // user is not donating
        if (donor === null) return;

        if (message.attachments.size !== 0) {
            // TODO: Fix image data missing issue

            for (const attachmentPair of message.attachments) {
                await message.channel.sendTyping();
                const attachment = attachmentPair[1];

                // get image binarydata
                const resp = await axios.get(attachment.url, {
                    responseType: "arraybuffer",
                });

                await saveAndSendMessage(message, resp.data, donor);
            }
        } else if (imgurResult) {
            await message.channel.sendTyping();

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
            await saveAndSendMessage(message, imageResp.data, donor);
        }
    },
};
