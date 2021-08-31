const axios = require("axios").default;
const { info } = require("../../graphics/embeds");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;
        const result = message.content.match(
            /https:\/\/e(?:x|-)hentai\.org\/g\/([0-9]+)\/([0-9a-z]+)\//
        );
        if (result) {
            // const url = result[0];
            const galleryId = parseInt(result[1]);
            const galleryToken = result[2];

            await message.channel.sendTyping();

            const resp = await axios.post("https://api.e-hentai.org/api.php", {
                method: "gdata",
                gidlist: [[galleryId, galleryToken]],
                namespace: 1,
            });

            const galleryMetadata = resp.data.gmetadata[0];

            // resolve tags and translate
            const translateTags = [];
            galleryMetadata.tags.forEach((element) =>
                translateTags.push(
                    // tag translate is welcome
                    element
                        .replace("parody:", "二創:")
                        .replace("character:", "角色:")
                        .replace("group:", "社團:")
                        .replace("artist:", "畫師:")
                        .replace("language:", "語言:")
                        .replace("female:", "女性:")
                        .replace("male:", "男性:")
                        .replace("originl", "原創")
                )
            );

            // build embed
            const embed = info(
                message.client,
                "「以下是這本魔法書的相關資訊...」"
            );
            embed.setImage(galleryMetadata.thumb);

            embed.addFields(
                {
                    name: "標題",
                    value: galleryMetadata.title,
                    inline: false,
                },
                {
                    name: "類別",
                    value: galleryMetadata.category,
                    inline: true,
                },
                {
                    name: "評分",
                    value: galleryMetadata.rating,
                    inline: true,
                },
                {
                    name: "上傳者",
                    value: galleryMetadata.uploader,
                    inline: true,
                },
                {
                    name: "標籤",
                    value: translateTags.join("\n"),
                    inline: false,
                },
                {
                    name: "檔案數量",
                    value: galleryMetadata.filecount,
                    inline: true,
                },
                {
                    name: "已清除",
                    value: galleryMetadata.expunged ? "是" : "否",
                    inline: true,
                },
                {
                    name: "id",
                    value: `${galleryMetadata.gid}`,
                    inline: true,
                },
                {
                    name: "token",
                    value: galleryMetadata.token,
                    inline: true,
                }
            );

            await message.channel.send({ embeds: [embed] });
        }
    },
};
