const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("choose")
        .setDescription("在各項內容中抽一個(內容數量至多25個)")
        .addStringOption((option) =>
            option
                .setName("options")
                .setDescription("要抽的項目(用半形逗號分開)")
                .setRequired(true)
        ),
    async execute(interaction) {
        const inputs = interaction.options.getString("options").split(",");
        await interaction.reply(
            inputs[Math.floor(Math.random() * inputs.length)]
        );
    },
};
