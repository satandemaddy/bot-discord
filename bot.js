console.log("ARRANCANDO BOT...");

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

client.login(process.env.TOKEN)
  .then(() => console.log("LOGIN OK"))
  .catch(err => console.error("ERROR LOGIN:", err));