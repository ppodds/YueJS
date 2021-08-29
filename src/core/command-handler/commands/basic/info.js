const { SlashCommandBuilder } = require("@discordjs/builders");
const { info } = require("../../../graphics/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("查看系統狀況"),
    async execute(interaction) {
        const embed = info(
            interaction.client,
            "「嗯.....差不多現在就是這樣子吧.....」"
        );
        embed.addFields(
            {
                name: "和你的距離",
                value: `${interaction.client.ws.ping}`,
                inline: false,
            }
            /*
            {
                name: "pic圖庫數量",
                value: `???`,
                inline: false
            },{
                name: "wtfpic圖庫數量",
                value: `???`,
                inline: false
            },{
                name: "hpic圖庫數量",
                value: `???`,
                inline: false
            },
            */
        );
        if (process.platform === "linux") {
            /*
            temp = await status.get_temp()
            cpu_usage = await status.measure_cpu_usage()
            ram = await status.get_ram()
            disk = await status.get_disk()
            embed.add_field(name='系統資訊', value=f"溫度： {str(temp)}\'C           CPU使用量： {str(cpu_usage)}%", inline=False)
            embed.add_field(name='記憶體使用狀況',
                            value=f"使用情形： {str(ram['used'])}M/{str(ram['total'])}M    已用： {str(ram['percent'])}％   剩餘： {str(ram['free'])}M",
                            inline=False)
            embed.add_field(name='硬碟使用狀況',
                            value=f"使用情形： {disk['used']}/{disk['total']}    已用： {disk['percent']}   剩餘： {disk['free']}",
                            inline=False)
            */
        }
        await interaction.reply({ embeds: [embed] });
    },
};
