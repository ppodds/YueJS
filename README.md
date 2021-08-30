# YueJS

## About

This is a JavaScript rewrite version of my Discord bot Yue. Yue was using in NCU CSIE Discord Server and World of Warships guild PTT NiceBoat. It made so much fun. But the library used by Yue is no longer maintance([detail](https://gist.github.com/Rapptz/4a2f62751b9600a31a0d3c78100287f1)). In fact, the origin one which written by Python might not work properly in the soon future, so I decide to write a new one with [discord.js](https://github.com/discordjs/discord.js/).

## Installation

**Node.js 16.6.0 or newer is required.**

First, clone this repository.

```shell
git clone https://github.com/ppodds/YueJS.git
cd YueJS
npm install
```

Second, configure the config files. (at `src/config`)

```json
{
    "name": "Bot name",
    "statusList": ["a", "list", "of", "status"],
    "statusType": "Bot status type, either 'PLAYING', 'LISTENING' or 'WATCHING'",
    "token": "your token. you can get it on Developer panel",
    "env": "dev or prod",
    "dev": {
        "clientId": "123456789",
        "guildId": "123456789"
    },
    "author": {
        "avatar": "author avator url"
    }
}
```

Final, use `npm run start` check whether it can work.
