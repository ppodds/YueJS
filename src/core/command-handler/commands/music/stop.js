const { SlashCommandBuilder } = require("@discordjs/builders");
const PlayerManager = require("../../../music/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("讓Yue離開 並清空預計要唱的歌曲"),
    async execute(interaction) {
        const user = interaction.member;

        if (!user)
            return await interaction.reply("似乎在私聊時不能做這些呢....");
        else if (!PlayerManager.exist(interaction.guild))
            return await interaction.reply("嗯? 我沒有在唱歌喔~");

        PlayerManager.cleanup(interaction.guild);
        await interaction.reply("表演結束! 下次也請多多支持!");
    },
};
