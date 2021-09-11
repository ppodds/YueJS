const { SlashCommandBuilder } = require("@discordjs/builders");
const PlayerManager = require("../../../music/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("讓Yue唱Youtube有的歌曲")
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("youtube連結")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.member;
        const url = interaction.options.getString("url");

        if (!user)
            return await interaction.reply("似乎在私聊時不能做這些呢....");

        await interaction.deferReply();

        const musicPlayer = PlayerManager.get(interaction);
        const resource = await musicPlayer.createResource(url, user);
        musicPlayer.add(resource);
        await interaction.editReply(
            `\`\`\`[已增加 ${resource.metadata.videoDetails.title} 到撥放序列中]\`\`\``
        );
    },
};
