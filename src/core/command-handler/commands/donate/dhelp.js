const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dhelp")
        .setDescription("觀看Yue的貢獻指令說明"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「想為Yue做些什麼? 可以呦....」\n貢獻說明:貢獻完會獲得Yue的喜愛，Yue會願意為你做更多事(不同貢獻類別獲取量不同)\n詳細請看dlist"
        );
        embed.addFields(
            {
                name: "donate start 【類別】",
                value: "對Yue貢獻一些東西(直接上傳附件即可)'",
                inline: false,
            },
            {
                name: "donate end",
                value: "通知Yue東西給完了",
                inline: false,
            },
            {
                name: "donate list",
                value: "檢視可以貢獻給Yue的類別清單",
                inline: false,
            },
            {
                name: "exp 【目標(可選)】",
                value: "檢視Yue對目標的好感度，若無目標則顯示自己的好感度",
                inline: false,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
