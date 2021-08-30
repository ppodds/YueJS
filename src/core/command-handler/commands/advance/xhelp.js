const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xhelp")
        .setDescription("觀看Yue的特殊指令說明"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「有些事情 Yue是指跟喜歡的人才做喔~ :heart:」"
        );
        embed.addFields(
            {
                name: "和Yue聊天的方式",
                value: "「在訊息前加上-就可以和Yue說話啦~    嘻嘻~」",
                inline: false,
            },
            {
                name: "reply add 【關鍵字】 【內容】",
                value: "讓Yue在下次聽到你說這句話時回應你",
                inline: false,
            },
            {
                name: "reply del 【關鍵字】",
                value: "讓Yue在下次聽到你說這句話時不再回應你",
                inline: false,
            },
            {
                name: "reply list",
                value: "讓Yue把你以前下過的指示念給你聽讓你複習",
                inline: false,
            },
            {
                name: "replyg add 【關鍵字】 【內容】",
                value: "讓Yue在下次聽到你說這句話時回應你(全域)",
                inline: false,
            },
            {
                name: "replyg del 【關鍵字】",
                value: "讓Yue在下次聽到你說這句話時不再回應你(全域)",
                inline: false,
            },
            {
                name: "replyg list",
                value: "讓Yue把你以前下過的指示念給你聽讓你複習(全域)",
                inline: false,
            },
            {
                name: "replyf add 【關鍵字】 【內容】",
                value: "(特殊)同amr 但要加入{message}來代換字詞，且關鍵字後要留至少一空白，空白後接代換字詞",
                inline: false,
            },
            {
                name: "replyf del 【關鍵字】",
                value: "(特殊)同dmr 但是是刪除amrm的內容",
                inline: false,
            },
            {
                name: "replyf list",
                value: "(特殊)列出已下過的格式化回覆清單",
                inline: false,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
