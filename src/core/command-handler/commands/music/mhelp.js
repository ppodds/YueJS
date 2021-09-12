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
            {
                name: "play",
                value: "讓Yue唱Youtube有的歌曲",
                inline: false,
            },
            {
                name: "join",
                value: "讓Yue加入你所在的頻道",
                inline: false,
            },
            {
                name: "queue",
                value: "觀看接下來歌曲的順序",
                inline: false,
            },
            {
                name: "playing",
                value: "觀看正在撥放中的歌曲資訊",
                inline: false,
            },
            {
                name: "pause",
                value: "讓Yue暫停唱歌",
                inline: false,
            },
            {
                name: "resume",
                value: "讓Yue繼續唱歌",
                inline: false,
            },
            {
                name: "skip",
                value: "讓Yue跳過當前正在唱的歌",
                inline: false,
            },
            {
                name: "stop",
                value: "讓Yue離開 並清空預計要唱的歌曲",
                inline: false,
            }
        );
        await interaction.reply({ embeds: [embed] });
    },
};
