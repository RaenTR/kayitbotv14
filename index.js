const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();
const mongo = require('./database/mongo');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
const commands = commandFiles.map(file => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  return command.data.toJSON();
});

client.commands.forEach((command, name) => {
  console.log(chalk.red(`Loaded command: ${name}`));
});

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => {
      console.log(chalk.green(`Executing once event: ${event.name}`));
      event.execute(...args, client);
    });
  } else {
    client.on(event.name, (...args) => {
      console.log(chalk.blue(`Executing event: ${event.name}`));
      event.execute(...args, client);
    });
  }
}



client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN);
