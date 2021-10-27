const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("取得目標的Discord頭像(無目標則獲得自己的頭像)")
        .addUserOption((option) =>
            option.setName("target").setDescription("目標使用者")
        ),
    async execute(interaction) {
        const embed = info(interaction.client, "「看來這就是你要的呢...」");
        const target = interaction.options.getUser("target");
        if (target) embed.setImage(target.avatarURL());
        else embed.setImage(interaction.user.avatarURL());
        await interaction.reply({ embeds: [embed] });
    },
};
