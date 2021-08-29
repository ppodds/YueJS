const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("觀看Yue的基本指令說明"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「這麼想跟Yue說話嗎? 也...也不是不可以啦~」"
        );
        embed.addFields(
            {
                name: "和Yue聊天的方式",
                value: "「在訊息前加上-就可以和Yue說話啦~    嘻嘻~」",
                inline: false,
            },
            {
                name: ":heart: :hearts: :heart: 指令清單 :heart: :hearts: :heart:",
                value: "----------------------------------------------------------",
                inline: false,
            },
            {
                name: "help",
                value: "指令說明",
                inline: false,
            },
            {
                name: "xhelp",
                value: "特殊指令說明",
                inline: false,
            },
            {
                name: "mhelp",
                value: "音樂相關指令說明",
                inline: false,
            },
            {
                name: "dhelp",
                value: "貢獻指令說明",
                inline: false,
            },
            {
                name: "ahelp",
                value: "助手指令說明",
                inline: false,
            },
            {
                name: "rpghelp",
                value: "RPG指令說明",
                inline: false,
            },
            {
                name: "shelp",
                value: "股海指令說明",
                inline: false,
            },
            {
                name: "info",
                value: "檢視系統的各項狀態",
                inline: false,
            },
            {
                name: "choose　【內容1】　【內容2】",
                value: "在各項內容中抽一個(內容數量無上限)",
                inline: false,
            },
            {
                name: "avatar　【目標(可選)】",
                value: "取得目標的Discord頭像(無目標則獲得自己的頭像)",
                inline: false,
            },
            {
                name: "pic",
                value: "從donate pic圖庫抽一張圖(需要好感度20)",
                inline: false,
            },
            {
                name: "hpic",
                value: "從donate hpic圖庫抽一張圖(需要在nsfw頻道/好感度30)",
                inline: false,
            },
            {
                name: "wtfpic",
                value: "從donate wtfpic圖庫抽一張圖",
                inline: false,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
