const {
    Message,
    MessageActionRow,
    MessageEmbed,
    MessageButton,
} = require("discord.js");
const colors = require("./colors");
const { author } = require("../../config/bot-config.json");
const reactions = require("./reactions");

module.exports = {
    info(client, description, color) {
        return new MessageEmbed()
            .setColor(color || colors.primary)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author.avatar);
    },

    warn(description) {
        return new MessageEmbed()
            .setColor(colors.warn)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author);
    },

    error(description) {
        return new MessageEmbed()
            .setColor(colors.error)
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(description)
            .setFooter("由ppodds親手調教", author);
    },
    /**
     * Send a pagination embed reply
     * @param {Interaction} interaction interaction object of interaction event
     * @param {MessageEmbed[]} pages an array of MessageEmbed, each one is a page of paginationEmbed
     * @param {MessageButton[]} buttonList an array of MessageButton which length is 2
     * @param {number} timeout timeout(ms)
     * @returns {Promise<Message>} reply message
     */
    async paginationEmbed(interaction, pages, buttonList, timeout = 120000) {
        // reference: https://github.com/ryzyx/discordjs-button-pagination

        if (!pages) throw new Error("Pages are not given.");
        if (!buttonList) throw new Error("Buttons are not given.");
        if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
            throw new Error("Link buttons are not supported");
        if (buttonList.length !== 2) throw new Error("Need two buttons.");

        let page = 0;

        const originDescription = pages[page].description;
        const row = new MessageActionRow().addComponents(buttonList);
        const curPage = await interaction.reply({
            embeds: [
                pages[page].setDescription(
                    originDescription +
                        `
                        目前顯示的是第 ${page + 1} 頁的結果 共有 ${
                            pages.length
                        } 頁`
                ),
            ],
            components: [row],
            fetchReply: true,
        });

        const filter = (i) =>
            i.customId === buttonList[0].customId ||
            i.customId === buttonList[1].customId;

        const collector = await curPage.createMessageComponentCollector({
            filter,
            time: timeout,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case buttonList[0].customId:
                    page = page > 0 ? --page : pages.length - 1;
                    break;
                case buttonList[1].customId:
                    page = page + 1 < pages.length ? ++page : 0;
                    break;
                default:
                    break;
            }
            await i.deferUpdate();
            await i.editReply({
                embeds: [
                    pages[page].setDescription(
                        originDescription +
                            `
                            目前顯示的是第 ${page + 1} 頁的結果 共有 ${
                                pages.length
                            } 頁`
                    ),
                ],
                components: [row],
            });
            collector.resetTimer();
        });

        collector.on("end", () => {
            if (!curPage.deleted) {
                const disabledRow = new MessageActionRow().addComponents(
                    buttonList[0].setDisabled(true),
                    buttonList[1].setDisabled(true)
                );
                curPage.edit({
                    embeds: [
                        pages[page].setDescription(
                            originDescription +
                                `
                                目前顯示的是第 ${page + 1} 頁的結果 共有 ${
                                    pages.length
                                } 頁`
                        ),
                    ],
                    components: [disabledRow],
                });
            }
        });

        return curPage;
    },
    /**
     * Send a select menu embed reply
     * @param {Interaction} interaction interaction object of interaction event
     * @param {MessageEmbed} embed original embed
     * @param {number} options options amount (1~5)
     * @param {Function} callback option callback function Ex: function foo(option) {}
     * @param {number} timeout timeout(ms)
     * @returns {Promise<Message>} reply message
     */
    async selectMenuEmbed(
        interaction,
        embed,
        options,
        callback,
        timeout = 60000
    ) {
        if (!embed) throw new Error("Embed are not given.");
        if (!options) throw new Error("options amount are not given.");
        if (options > 5 || options < 1)
            throw new Error("options amount need be a integer in 1~5.");
        if (!callback)
            throw new Error("options callback function are not given.");

        const buttonList = [];
        for (let i = 0; i < options; i++) {
            switch (i) {
                case 0:
                    buttonList.push(
                        new MessageButton()
                            .setCustomId("one")
                            .setEmoji(reactions.one)
                            .setStyle("SECONDARY")
                    );
                    break;
                case 1:
                    buttonList.push(
                        new MessageButton()
                            .setCustomId("two")
                            .setEmoji(reactions.two)
                            .setStyle("SECONDARY")
                    );
                    break;
                case 2:
                    buttonList.push(
                        new MessageButton()
                            .setCustomId("three")
                            .setEmoji(reactions.three)
                            .setStyle("SECONDARY")
                    );
                    break;
                case 3:
                    buttonList.push(
                        new MessageButton()
                            .setCustomId("four")
                            .setEmoji(reactions.four)
                            .setStyle("SECONDARY")
                    );
                    break;
                case 4:
                    buttonList.push(
                        new MessageButton()
                            .setCustomId("five")
                            .setEmoji(reactions.five)
                            .setStyle("SECONDARY")
                    );
                    break;
            }
        }

        const row = new MessageActionRow().addComponents(buttonList);
        let menuEmbed;
        if (interaction.deferred) {
            // menuEmbed = await interaction.editReply({
            //     content: "請選擇以下選項",
            //     fetchReply: true,
            // });
            menuEmbed = await interaction.editReply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });
        } else {
            menuEmbed = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true,
            });
        }

        const filter = (i) =>
            i.customId === "one" ||
            i.customId === "two" ||
            i.customId === "three" ||
            i.customId === "four" ||
            i.customId === "five";

        const collector = await menuEmbed.createMessageComponentCollector({
            filter,
            time: timeout,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "one":
                    callback(0);
                    break;
                case "two":
                    callback(1);
                    break;
                case "three":
                    callback(2);
                    break;
                case "four":
                    callback(3);
                    break;
                case "five":
                    callback(4);
                    break;
                default:
                    break;
            }
            await i.deferUpdate();
            collector.stop("user select");
        });

        collector.on("end", () => {
            if (!menuEmbed.deleted) {
                buttonList.forEach((button) => button.setDisabled(true));
                const disabledRow = new MessageActionRow().addComponents(
                    buttonList
                );
                menuEmbed.edit({
                    embeds: [embed],
                    components: [disabledRow],
                });
            }
        });

        return menuEmbed;
    },
    /**
     * Generate a button list for paginationEmbed
     * @returns {MessageButton[]} a button list for paginationEmbed
     */
    paginationButton() {
        const buttonList = [
            new MessageButton()
                .setCustomId("prevPage")
                .setLabel("上一頁")
                .setStyle("PRIMARY"),
            new MessageButton()
                .setCustomId("nextPage")
                .setLabel("下一頁")
                .setStyle("PRIMARY"),
        ];
        return buttonList;
    },
};
