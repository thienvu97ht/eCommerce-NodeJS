'use strict';

const { Client, GatewayIntentBits } = require('discord.js');
const { CHANNEL_ID_DISCORD, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // add channelId
    this.channelId = CHANNEL_ID_DISCORD;

    this.client.on('ready', () => {
      console.log(`Logged is as ${client.user.tag}`);
    });

    this.client.login(TOKEN_DISCORD);
  }

  sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Couldn't find the channel...`, this.channelId);
    }

    channel.send(message).cache((e) => console.error(e));
  }
}

const loggerService = new LoggerService();

module.exports = new LoggerService();
