const { Donor } = require("../../database/models/donor");
const Logger = require("../../utils/logger");
const { Collection } = require("discord.js");
const axios = require("axios").default;
const FileType = require("file-type");
const { Image } = require("../../database/models/image");
const { send } = require("../../graphics/message");
const ImageManager = require("../../image/ImageManager");
const { makeRegularImage } = require("../../image/imageSimilar");
const { User } = require("../../database/models/user");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;
        // TODO check imgur url or image raw and download
        if (message.attachments.size !== 0) {
            let donor = await Donor.findOne({
                where: {
                    guild: message.guildId ? message.guildId : "dm",
                    channel: message.channelId,
                    user: message.author.id,
                },
            });
            // user is not donating
            if (donor === null) return;

            for (let attachmentPair of message.attachments) {
                await message.channel.sendTyping();
                const attachment = attachmentPair[1];

                // get image binarydata
                const resp = await axios.get(attachment.url, {
                    responseType: "arraybuffer",
                });
                // get image ext and mime
                const filetype = await FileType.fromBuffer(resp.data);
                if (filetype.mime.startsWith("image/")) {
                    // TODO check if image has existed in database
                    const regularImage = await makeRegularImage(resp.data);
                    const inDatabase = await ImageManager.inDatabase(
                        donor.type,
                        regularImage
                    );
                    if (inDatabase)
                        // the picture is already in the database
                        return await send(
                            message.channel,
                            "Yue已經有這個了....",
                            20000
                        );

                    const image = await Image.add(
                        donor.type,
                        message.author.id,
                        filetype.ext,
                        resp.data
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
                    ImageManager.addImage(donor.type, regularImage);
                    if (!message.deleted && message.deletable)
                        await message.delete();
                } else {
                    await send(
                        message.channel,
                        "這不是我能使用的呢....",
                        20000
                    );
                }
            }
        }
    },
};
