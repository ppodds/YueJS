const { SlashCommandBuilder } = require("@discordjs/builders");
const { Reply } = require("../../../database/models/reply");
const Logger = require("../../../utils/logger");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reply")
        .setDescription("設定對話回應")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("新增對話回應")
                .addStringOption((option) =>
                    option
                        .setName("key")
                        .setDescription("關鍵字")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("response")
                        .setDescription("反應內容")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("del")
                .setDescription("刪除對話回應")
                .addStringOption((option) =>
                    option
                        .setName("key")
                        .setDescription("關鍵字")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("檢視對話回應清單")
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === "add") {
            const key = interaction.options.getString("key");
            const response = interaction.options.getString("response");

            // create reply if not exist
            const [reply, created] = await Reply.findOrCreate({
                where: {
                    key: key,
                    dm: !interaction.inGuild(),
                    scope: interaction.inGuild()
                        ? interaction.guildId
                        : interaction.user.id,
                    formatted: false,
                },
                defaults: {
                    response: response,
                },
            });

            if (created) {
                await interaction.reply("Yue記下來啦~ 下次會努力的~");
                Logger.info(
                    `${interaction.user.id} use reply add at ${
                        interaction.inGuild()
                            ? interaction.guildId
                            : "dm channel"
                    } key；{key} response: {value}`
                );
            } else {
                await interaction.reply("好像已經有人對Yue下過相同的指示了呢~");
            }
        } else if (interaction.options.getSubcommand() === "del") {
            const key = interaction.options.getString("key");

            const reply = await Reply.findOne({
                where: {
                    key: key,
                    dm: !interaction.inGuild(),
                    scope: interaction.inGuild()
                        ? interaction.guildId
                        : interaction.user.id,
                    formatted: false,
                },
            });

            if (reply === null) {
                await interaction.reply("好像沒有對Yue下過這樣的指示呢~");
            } else {
                await reply.destroy();
                await interaction.reply("Yue記下來啦~");
            }
        } else if (interaction.options.getSubcommand() === "list") {
            const replies = await Reply.findAll({
                where: {
                    dm: !interaction.inGuild(),
                    scope: interaction.inGuild()
                        ? interaction.guildId
                        : interaction.user.id,
                    formatted: false,
                },
                attributes: ["key", "response"],
            });

            const embed = info(
                interaction.client,
                "「以前你跟我說過的這些~ Yue通通都記住了喔~ :heart:」"
            );

            embed.addFields(
                {
                    name: "格式範例",
                    value: "「待會Yue就用這種方式照著念喔~」",
                    inline: false,
                },
                {
                    name: "關鍵字",
                    value: "回應內容",
                    inline: false,
                }
            );

            let hasReplied = false;
            let count = 2;
            for (let reply of replies) {
                if (count === 25) {
                    if (hasReplied)
                        await interaction.followUp({ embeds: [embed] });
                    else await interaction.reply({ embeds: [embed] });
                    count = 3;
                    embed.spliceFields(2, 23, {
                        name: reply.key,
                        value: reply.response,
                        inline: false,
                    });
                } else {
                    count++;
                    embed.addField(reply.key, reply.response);
                }
            }
            if (hasReplied) await interaction.followUp({ embeds: [embed] });
            else await interaction.reply({ embeds: [embed] });
        }
    },
};
