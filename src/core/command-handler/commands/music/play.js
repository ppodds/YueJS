const { SlashCommandBuilder } = require("@discordjs/builders");
const PlayerManager = require("../../../music/PlayerManager");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const { info, selectMenuEmbed } = require("../../../graphics/embeds");
const reactions = require("../../../graphics/reactions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("讓Yue唱Youtube有的歌曲")
        .addStringOption((option) =>
            option
                .setName("target")
                .setDescription("youtube連結或搜尋關鍵字")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.member;
        const target = interaction.options.getString("target");

        if (!user)
            return await interaction.reply("似乎在私聊時不能做這些呢....");
        else if (!interaction.member.voice.channelId)
            return await interaction.reply("看起來你不在語音頻道裡呢...");

        await interaction.deferReply();

        const musicPlayer = PlayerManager.get(interaction);

        const regex =
            /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (target.match(regex) ? true : false) {
            const resource = await musicPlayer.createResource(target, user);
            musicPlayer.add(resource);
            await interaction.editReply(
                `\`\`\`[已增加 ${resource.metadata.videoDetails.title} 到撥放序列中]\`\`\``
            );
        } else {
            try {
                // playlist
                const playlist = await ytpl(target, { limit: Infinity });
                const tasks = [];
                for (const item of playlist.items)
                    tasks.push(musicPlayer.createResource(item.shortUrl, user));
                const resources = await Promise.all(tasks);
                musicPlayer.addList(resources);
                await interaction.editReply(
                    `\`\`\`[已增加 ${playlist.title} 的所有歌曲到撥放序列中]\`\`\``
                );
            } catch (err) {
                // use key word search
                const searchResult = await ytsr(target, { limit: 5 });
                if (searchResult.items.length === 0)
                    return await interaction.editReply(
                        "我找不到有這個關鍵字的歌曲呢..."
                    );

                let description =
                    "「我找到了這些結果，在下面選一個吧!」(時限60秒)";
                for (let i = 0; i < searchResult.items.length; i++) {
                    description += `
${i + 1}. ${reactions.item} [${searchResult.items[i].title}](${
                        searchResult.items[i].url
                    }) (${searchResult.items[i].duration})`;
                }

                const embed = info(interaction.client, description);
                await selectMenuEmbed(
                    interaction,
                    embed,
                    searchResult.items.length,
                    async (option) => {
                        const resource = await musicPlayer.createResource(
                            searchResult.items[option].url,
                            user
                        );
                        musicPlayer.add(resource);
                        await interaction.followUp(
                            `\`\`\`[已增加 ${searchResult.items[option].title} 到撥放序列中]\`\`\``
                        );
                    }
                );
            }
        }
    },
};
