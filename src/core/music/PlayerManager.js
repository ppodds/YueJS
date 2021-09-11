const { Collection, CommandInteraction } = require("discord.js");
const MusicPlayer = require("./MusicPlayer");

class PlayerManager {
    /**
     * Guild music players
     * key: guildId  value: MusicPlayer
     */
    static players = new Collection();
    /**
     * Get guild music player
     * @param {CommandInteraction} interaction interaction object of discord.js
     * @returns {MusicPlayer} guild's music player
     */
    static get(interaction) {
        const musicPlayer = this.players.get(interaction.guildId);
        if (musicPlayer && !musicPlayer.destroyed) {
            return this.players.get(interaction.guildId);
        } else {
            const musicPlayer = new MusicPlayer(interaction);
            this.players.set(interaction.guildId, musicPlayer);
            return musicPlayer;
        }
    }
    /**
     * Check whether the guild's music player exists
     * @param {Guild} guild guild object
     */
    static exist(guild) {
        const musicPlayer = this.players.get(guild.id);
        if (musicPlayer) {
            if (!musicPlayer.destroyed) return true;
            else this.cleanup(guild);
        }
        return false;
    }
    /**
     * Delete guild's music player
     * @param {Guild} guild target guild
     */
    static cleanup(guild) {
        const musicPlayer = this.players.get(guild.id);
        musicPlayer.destroy();
        this.players.delete(guild.id);
    }
}
module.exports = PlayerManager;
