'use strict';

const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN_DISCORD } = process.env;

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

client.login(TOKEN_DISCORD);

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return;
  if (msg.content === 'hello') {
    msg.reply('Hello! How can i assits you today!');
  }
});
