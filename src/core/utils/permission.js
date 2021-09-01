const { User } = require("discord.js");
const { env, dev } = require("../../config/bot-config.json");

module.exports = {
    /**
     * Check if a user is one of bot owners.
     * @param {Client} client Client object
     * @param {User} user user who needs to be check
     * @returns {Promise<boolean>} if the user is one of bot owners
     */
    async isOwner(client, user) {
        if (!client.application?.owner) await client.application?.fetch();

        if (client.application.owner instanceof User) {
            return user.id === client.application.owner.id;
        } else {
            // owner is a Team object
            return client.application.owner.members.find(
                (member) => member.user.id === user.id
            );
        }
    },
    /**
     * Get owner only permission for slash command
     * @param {Client} client client object
     * @returns {Promise<ApplicationCommandPermissionData[]>} owner only permission setting
     */
    async ownerOnly(client) {
        if (!client.application?.owner) await client.application?.fetch();

        if (client.application.owner instanceof User) {
            return [
                {
                    id: client.application.owner.id,
                    type: "USER",
                    permission: true,
                },
            ];
        } else {
            // owner is a Team object
            const owners = [];
            client.application.owner.members.forEach(function (member, key) {
                owners.push({
                    id: member.user.id,
                    type: "USER",
                    permission: true,
                });
            });
            return owners;
        }
    },
    /**
     * Set slash command permission
     * @param {Client} client client object
     * @param {string} name command name
     * @param {Promise<ApplicationCommandPermissionData[]>} permissions permissions you want to set
     */
    async setPermission(client, name, permissions) {
        let commands;
        if (env === "prod") {
            if (!client.application) await client.application?.fetch();
            commands = await client.application.commands.fetch();
        } else {
            commands = await client.guilds.cache
                .get(dev.guildId)
                ?.commands.fetch();
        }
        await commands
            .find((command) => command.name === name)
            .permissions.add({ permissions });
    },
};
