const { 
  Client, 
  GatewayIntentBits 
} = require('discord.js');

const { 
  joinVoiceChannel, 
  getVoiceConnection 
} = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const PREFIX = 'n.';
const OWNER_ID = '1445527702332244159';

client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  if (message.author.id !== OWNER_ID) return;

  const cmd = message.content.slice(PREFIX.length).trim().toLowerCase();
  const channel = message.member.voice.channel;

  if (cmd === 'join') {
    if (!channel) return message.reply('Metete a un VC primero');

    try {
      const existing = getVoiceConnection(channel.guild.id);

      if (existing && existing.joinConfig.channelId !== channel.id) {
        existing.destroy();
      }

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      message.reply('Entré al VC');

    } catch (err) {
      console.error(err);
      message.reply('Error al entrar');
    }
  }

  if (cmd === 'leave') {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply('No estoy en VC');

    connection.destroy();
    message.reply('Me salí');
  }
});

client.login(process.env.TOKEN);