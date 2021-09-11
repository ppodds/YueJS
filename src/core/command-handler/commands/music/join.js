const { SlashCommandBuilder } = require("@discordjs/builders");
const PlayerManager = require("../../../music/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("讓Yue加入你所在的頻道"),
    async execute(interaction) {
        const user = interaction.member;

        if (!user)
            return await interaction.reply("似乎在私聊時不能做這些呢....");
        else if (!interaction.member.voice.channelId)
            return await interaction.reply("看起來你不在語音頻道裡呢...");
        else if (!PlayerManager.exist(interaction.guild))
            return await interaction.reply("嗯? 我沒有在唱歌喔~");

        const musicPlayer = PlayerManager.get(interaction);
        musicPlayer.changeChannel(user.voice.channel);
        await interaction.reply("我來了哦~");
    },
};
