const { SlashCommandBuilder } = require("@discordjs/builders");
const ImageManager = require("../../../image/ImageManager");
const Logger = require("../../../utils/logger");
const { ownerOnly, setPermission } = require("../../../utils/permission");

module.exports = {
    data: new SlashCommandBuilder().setName("bye").setDescription("關閉Bot"),
    async init(client, name) {
        // This command is owner only
        const permissions = await ownerOnly(client);
        await setPermission(client, name, permissions);
    },
    async execute(interaction) {
        await interaction.reply("處理中: 儲存圖片暫存...");
        await ImageManager.save();
        await interaction.editReply("那就到這邊了.... 下次再見吧....");
        interaction.client.destroy();
    },
};
