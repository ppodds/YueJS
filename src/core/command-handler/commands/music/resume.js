const { SlashCommandBuilder } = require("@discordjs/builders");
const PlayerManager = require("../../../music/PlayerManager");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("讓Yue繼續唱歌"),
    async execute(interaction) {
        const user = interaction.member;

        if (!user)
            return await interaction.reply("似乎在私聊時不能做這些呢....");
        else if (!PlayerManager.exist(interaction.guild))
            return await interaction.reply("嗯? 我沒有在唱歌喔~");

        const musicPlayer = PlayerManager.get(interaction);
        if (musicPlayer._player.state.status !== AudioPlayerStatus.Paused)
            return await interaction.reply(
                "我現在已經在唱歌了啦 <:i_yoshino:583658336054935562>"
            );

        musicPlayer.resume();
        await interaction.reply("那我就繼續唱哦....");
    },
};
