const { SlashCommandBuilder } = require("@discordjs/builders");
const { Image } = require("../../../database/models/image");
const { User } = require("../../../database/models/user");
const Logger = require("../../../utils/logger");
const { info } = require("../../../graphics/embeds");
const { MessageAttachment } = require("discord.js");
const { toDatetimeString } = require("../../../utils/time");

const MinimumDemand = {
    pic: 20,
    hpic: 30,
    wtfpic: 0,
};

async function replyImageEmbed(interaction, imageData) {
    if (!imageData) return await interaction.reply("該項圖庫中沒有圖片呢...");
    const file = new MessageAttachment(
        imageData.image,
        `${imageData.id}.${imageData.ext}`
    );

    let uploader;

    try {
        const t = await interaction.client.users.fetch(imageData.uploader);
        uploader = t ? t.username : "窩不知道";
    } catch (err) {
        Logger.error(err);
    }

    const embed = info(interaction.client, "「我找到了這個...」");

    embed.addFields(
        {
            name: "上傳者",
            value: uploader,
            inline: true,
        },
        { name: "圖片編號", value: imageData.id.toString(), inline: true },
        {
            name: "上傳時間",
            value: toDatetimeString(imageData.createdAt),
            inline: false,
        }
    );
    embed.setImage(`attachment://${imageData.id}.${imageData.ext}`);
    await interaction.reply({ embeds: [embed], files: [file] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("從貢獻的圖庫抽一張圖片")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("pic")
                .setDescription("從貢獻的pic圖庫抽一張圖(需要好感度20)")
                .addIntegerOption((option) =>
                    option.setName("id").setDescription("圖片的編號")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("hpic")
                .setDescription(
                    "從貢獻的hpic圖庫抽一張圖(需要在nsfw頻道/好感度30)"
                )
                .addIntegerOption((option) =>
                    option.setName("id").setDescription("圖片的編號")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("wtfpic")
                .setDescription("從貢獻的wtfpic圖庫抽一張圖")
                .addIntegerOption((option) =>
                    option.setName("id").setDescription("圖片的編號")
                )
        ),
    async execute(interaction) {
        const imageId = interaction.options.getInteger("id");
        const user = await User.get(interaction.user.id);
        const type = interaction.options.getSubcommand();

        if (!Image.allowType.includes(type))
            return await interaction.reply("不是支援的圖片類型呢...");
        else if (imageId !== null && imageId <= 0)
            return await interaction.reply("號碼需要大於0才行呢...");
        else if (type === "hpic" && !interaction.channel.nsfw)
            return await interaction.reply("在這邊h是不可以的!");

        // user picked image (null if user doesn't assign)
        let userPicked;
        if (imageId !== null) {
            userPicked = await Image.findOne({ where: { id: imageId } });
            if (!userPicked)
                return await interaction.reply("找不到這張圖呢...");
            else if (
                interaction.options.getSubcommand() !==
                Image.typeToString(userPicked.type)
            )
                return await interaction.reply(
                    "這張圖不是你選擇的圖片類型呢..."
                );
        } else userPicked = null;

        const check = await validateContribution(
            interaction,
            user,
            MinimumDemand[type]
        );

        if (check)
            await replyImageEmbed(
                interaction,
                userPicked ? userPicked : await Image.random(type)
            );
    },
};
async function validateContribution(interaction, user, minimumDemand) {
    if (user.contribution < minimumDemand) {
        await interaction.reply(
            "你跟Yue還不夠熟呢... 他有跟我說不要隨便幫陌生人忙的..."
        );
        return false;
    }
    return true;
}
