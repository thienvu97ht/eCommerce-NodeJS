'use strict';

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged is as ${client.user.tag}`);
});

const token = 'MTI1MDg2MjgwNzczMDM1NjM5Ng.GSajeI.Pl5hxoUecZtRoNWti1UMwKrXjoL7D68NZi9Q00';
client.login(token);

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return;
  if (msg.content === 'hello') {
    msg.reply('Hello! How can i assits you today!');
  }
});
