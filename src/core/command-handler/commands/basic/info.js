const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");
const { Image } = require("../../../database/models/image");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("查看系統狀況"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「嗯.....差不多現在就是這樣子吧.....」"
        );
        embed.addFields(
            {
                name: "和你的距離",
                value: `${interaction.client.ws.ping}`,
                inline: false,
            },

            {
                name: "pic圖庫數量",
                value: (await Image.amount("pic")).toString(),
                inline: true,
            },
            {
                name: "wtfpic圖庫數量",
                value: (await Image.amount("wtfpic")).toString(),
                inline: true,
            },
            {
                name: "hpic圖庫數量",
                value: (await Image.amount("hpic")).toString(),
                inline: true,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
