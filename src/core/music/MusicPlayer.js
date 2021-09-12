const ytdlDiscord = require("ytdl-core-discord");
const ytdl = require("ytdl-core");
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioResource,
    entersState,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus,
} = require("@discordjs/voice");
const { GuildMember } = require("discord.js");
const Logger = require("../utils/logger");

class MusicPlayer {
    constructor(interaction) {
        this._client = interaction.client;
        this._guild = interaction.guild;
        this._channel = interaction.channel;

        this._queue = [];
        this._queueLock = false;
        this._readyLock = false;
        this._np = null;
        this._volume = 0.2;
        this._current = null;
        this.destroyed = false;
        // this.looping = false

        this._connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: this._guild.id,
            adapterCreator: this._guild.voiceAdapterCreator,
        });

        this._connection.on("stateChange", async (oldState, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (
                    newState.reason ===
                        VoiceConnectionDisconnectReason.WebSocketClose &&
                    newState.closeCode === 4014
                ) {
                    /*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
                    try {
                        await entersState(
                            this._connection,
                            VoiceConnectionStatus.Connecting,
                            5000
                        );
                        // Probably moved voice channel
                    } catch {
                        this.destroy();
                        // Probably removed from voice channel
                    }
                } else if (this._connection.rejoinAttempts < 5) {
                    /*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
                    setTimeout(() => this._connection.rejoin(), 5000);
                } else {
                    /*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
                    this.destroy();
                }
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                /*
					Once destroyed, stop the subscription
				*/
                this.destroy();
            } else if (
                !this._readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting ||
                    newState.status === VoiceConnectionStatus.Signalling)
            ) {
                /*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
                this._readyLock = true;
                try {
                    await entersState(
                        this._connection,
                        VoiceConnectionStatus.Ready,
                        20000
                    );
                    this._readyLock = false;
                } catch {
                    if (
                        this._connection.state !==
                        VoiceConnectionStatus.Destroyed
                    )
                        this.destroy();
                }
            }
        });

        this._player = createAudioPlayer({ maxMissedFrames: 99999999 });
        // register event listener

        // Configure audio player
        this._player.on("stateChange", async (oldState, newState) => {
            if (
                newState.status === AudioPlayerStatus.Idle &&
                oldState.status !== AudioPlayerStatus.Idle
            ) {
                // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
                // The queue is then processed to start playing the next track, if one is available.
                if (!this._np.deleted && this._np.deletable)
                    await this._np.delete();
                this._np = null;
                this._current = null;
                this.processQueue();
            } else if (newState.status === AudioPlayerStatus.Playing) {
                // If the Playing state has been entered, then a new track has started playback.
            }
        });

        this._player.on("error", async (error) => {
            await this._channel.send("嗯....似乎沒辦法唱下去的樣子...");
        });

        this._connection.subscribe(this._player);
    }
    /**
     * Create a youtube resource by url
     * @param {string} url youtube url
     * @param {GuildMember} requester requester guild member object
     * @returns {Promise<AudioResource>} youtube resource contains metadata
     */
    async createResource(url, requester) {
        try {
            const stream = await ytdlDiscord(url);
            const metadata = await ytdl.getBasicInfo(url);
            metadata.requester = requester;
            const resource = createAudioResource(stream, {
                metadata: metadata,
                inputType: StreamType.Opus,
            });
            return resource;
        } catch (err) {
            throw new Error("找不到指定的Youtube影片呢...");
        }
    }

    /**
     * Add a track to music player queue
     * @param resource {AudioResource} youtube resource contains metadata
     */
    add(resource) {
        try {
            this._queue.push(resource);
            this.processQueue();
        } catch (err) {
            throw err;
        }
    }
    addList(resources) {
        try {
            resources.forEach((resource) => this._queue.push(resource));
            this.processQueue();
        } catch (err) {
            throw err;
        }
    }
    skip() {
        this._player.stop();
    }
    pause() {
        this._player.pause();
    }
    resume() {
        this._player.unpause();
    }
    /**
     * Attempts to play a Track from the queue
     */
    async processQueue() {
        if (
            this._queueLock ||
            this._player.state.status !== AudioPlayerStatus.Idle ||
            this._queue.length === 0
        ) {
            if (this._queue.length === 0) {
                await this._channel.send(
                    "清單中的歌曲都唱完啦! 那我就先去休息了!"
                );
                this.destroy();
            }
            return;
        }

        this.queueLock = true;

        const nextTrack = this._queue.shift();
        try {
            this._current = nextTrack;
            this._np = await this._channel.send(
                `**正在撥放:** \`${this._current.metadata.videoDetails.title}\` 點歌者: \`${this._current.metadata.requester.displayName}\``
            );
            this._player.play(nextTrack);
            this.queueLock = false;
        } catch (err) {
            this.queueLock = false;
            return this.processQueue();
        }
    }

    /**
     * Disconnect and cleanup the player.
     */
    destroy() {
        if (this._connection.state.status !== VoiceConnectionStatus.Destroyed)
            this._connection.destroy();
        this._player.stop(true);
        this._queue = null;
        this.destroyed = true;
    }
    /**
     * Change connected voice channel
     *
     * if new channel and old channel is the same, return true.
     * @returns {boolean} is success
     */
    changeChannel(channel) {
        if (this._channel.id !== channel.id)
            return this._connection.rejoin({ channelId: channel.id });
        return true;
    }
}

module.exports = MusicPlayer;
