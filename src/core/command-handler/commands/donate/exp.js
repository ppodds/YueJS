const { SlashCommandBuilder } = require("@discordjs/builders");
const { User } = require("../../../database/models/user");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exp")
        .setDescription("檢視Yue對目標的好感度，若無目標則顯示自己的好感度")
        .addUserOption((option) =>
            option.setName("target").setDescription("目標使用者")
        ),
    async execute(interaction) {
        const target = interaction.options.getUser("target");

        const donor = target
            ? await User.get(target.id)
            : await User.get(interaction.user.id);

        donor.contribution === 0
            ? await interaction.reply(
                  `嗯....Yue跟${target ? "他" : "你"}還不熟呢....`
              )
            : await interaction.reply(
                  `目前我對${target ? "他" : "你"}的好感度是${
                      donor.contribution
                  }點喔!`
              );
    },
};
