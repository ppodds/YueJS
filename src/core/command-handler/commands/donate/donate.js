const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");
const { Donor } = require("../../../database/models/donor");
const Logger = require("../../../utils/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("貢獻相關指令")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("start")
                .setDescription("開始貢獻資料")
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("資料類型")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("end").setDescription("結束貢獻資料")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("檢視可以貢獻給Yue的類別清單")
        ),
    async execute(interaction) {
        const allowType = ["pic", "hpic", "wtfpic"];
        if (interaction.options.getSubcommand() === "start") {
            const type = interaction.options.getString("type");
            if (!allowType.includes(type))
                return await interaction.reply({
                    content: "這不是我能使用的呢....",
                    ephemeral: true,
                });
            else if (type === "hpic" && !interaction.channel.nsfw)
                return await interaction.reply({
                    content: "在這裡h是不行的!",
                    ephemeral: true,
                });
            // create donor if not exist
            const [donor, created] = await Donor.findOrCreate({
                where: {
                    guild: interaction.inGuild() ? interaction.guildId : "dm",
                    channel: interaction.channelId,
                    user: interaction.user.id,
                },
                defaults: {
                    type: type,
                },
            });

            // user is donating in current channel
            if (!created) {
                return await interaction.reply({
                    content: "你不是要給我東西嗎? 還沒給又想來了?",
                    ephemeral: true,
                });
            }
            Logger.info(
                `${interaction.user.username} start donate ${type} at ${
                    interaction.inGuild()
                        ? interaction.guild.name +
                          "-" +
                          interaction.channel.name
                        : "dm channel"
                }`
            );
            return await interaction.reply("了解... 那麼把東西給我吧...");
        } else if (interaction.options.getSubcommand() === "end") {
            const donor = await Donor.findOne({
                where: {
                    guild: interaction.inGuild() ? interaction.guildId : "dm",
                    channel: interaction.channelId,
                    user: interaction.user.id,
                },
            });

            if (donor === null)
                return await interaction.reply({
                    content: "剛剛沒有說要給我東西呢...",
                    ephemeral: true,
                });

            await interaction.reply(
                `一共貢獻了${
                    donor.amount
                }張圖片，貢獻值增加了${donor.gainContribution()}點`
            );
            await donor.destroy();
        } else if (interaction.options.getSubcommand() === "list") {
            const embed = info(
                interaction.client,
                "「想為Yue做些什麼? 可以呦....」\n貢獻說明:貢獻完會獲得Yue的喜愛，Yue會願意為你做更多事"
            );
            embed.addFields(
                {
                    name: "pic",
                    value: "油圖(一張一點)",
                    inline: false,
                },
                {
                    name: "hpic",
                    value: "18+油圖(只能在nsfw頻道使用)(一張三點)",
                    inline: false,
                },
                {
                    name: "wtfpic",
                    value: "圖戰圖或梗圖(一張一點)",
                    inline: false,
                }
            );
            await interaction.reply({ embeds: [embed] });
        }
    },
};
