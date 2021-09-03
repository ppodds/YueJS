FROM node:16.8-bullseye

# ENV NODE_ENV=production

RUN mkdir -p /app

WORKDIR /app

# general package

RUN npm install -g node-gyp

# discord js core

RUN npm install discord.js @discordjs/rest discord-api-types @discordjs/builders \
    && npm install zlib-sync \
    && npm install bufferutil \
    && npm install utf-8-validate
# && npm install discord/erlpack

# voice support

RUN npm install @discordjs/voice \
    npm install sodium \
    && npm install @discordjs/opus 

# other package

RUN npm install async-lock \
    && npm install axios \
    && npm install beautify.log \
    && npm install file-type \
    && npm install sequelize \
    && npm install nodemon \
    && npm install mariadb \
    && npm install sharp

COPY ./src /app/src
COPY ./deploy-commands.js /app
COPY ./index.js /app

# deploy commands
RUN node deploy-commands.js

CMD [ "node" , "index.js"]