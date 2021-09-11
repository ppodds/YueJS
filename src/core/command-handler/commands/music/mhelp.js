const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mhelp")
        .setDescription("觀看Yue的音樂指令說明"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「想聽Yue唱歌嗎? 下次說不定有機會呢~~」"
        );
        embed.addFields(
            // {
            //     name: "join",
            //     value: "讓Yue加入你所在的頻道",
            //     inline: false,
            // },
            {
                name: "play",
                value: "讓Yue唱Youtube有的歌曲(不建議使用關鍵字 結果不一定準確)",
                inline: false,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
