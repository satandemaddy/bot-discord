const { 
  Client, 
  GatewayIntentBits 
} = require('discord.js');

const { 
  joinVoiceChannel, 
  getVoiceConnection 
} = require('@discordjs/voice');

const fs = require('fs');

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

const FILE = './vcdata.json';

// Cargar datos
let data = {};
if (fs.existsSync(FILE)) {
  data = JSON.parse(fs.readFileSync(FILE));
}

// Guardar datos
function saveData() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    const channel = message.member?.voice?.channel;

    console.log("CMD:", cmd, "ARGS:", args);

    // 🔊 JOIN
    if (cmd === 'join') {
      if (message.author.id !== OWNER_ID) return;
      if (!channel) return message.reply('Métete a un VC primero');

      const existing = getVoiceConnection(message.guild.id);
      if (existing) existing.destroy();

      joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      return message.reply('Entré al VC');
    }

    // 🔇 LEAVE
    if (cmd === 'leave') {
      if (message.author.id !== OWNER_ID) return;

      const connection = getVoiceConnection(message.guild.id);
      if (!connection) return message.reply('No estoy en VC');

      connection.destroy();
      return message.reply('Me salí');
    }

    // 🎬 SET VC
    if (cmd === 'setvc') {
      if (message.author.id !== OWNER_ID) {
        return message.reply('❌ No tienes permiso');
      }

      if (!channel) {
        return message.reply('❌ Debes estar en un VC');
      }

      if (args.length < 1) {
        return message.reply('❌ Uso: n.setvc horas [minutos]');
      }

      let hours = parseInt(args[0]);
      let minutes = args[1] ? parseInt(args[1]) : 0;

      if (isNaN(hours) || isNaN(minutes) || minutes >= 60 || hours < 0 || minutes < 0) {
        return message.reply('❌ Uso inválido\nEjemplo: n.setvc 300 o n.setvc 300 15');
      }

      data[channel.id] = {
        baseTime: (hours * 60 + minutes) * 60000,
        startTime: Date.now()
      };

      saveData();

      return message.reply(`✅ VC configurado\n⏱️ Tiempo base: ${hours}h ${minutes}m`);
    }

    // ⏱️ VER VC
    if (cmd === 'vc') {
      if (!channel) {
        return message.reply('❌ No estás en un canal de voz');
      }

      const vc = data[channel.id];

      if (!vc) {
        return message.reply('❌ Este VC no tiene tiempo configurado\nUsa: n.setvc');
      }

      const elapsed = Date.now() - vc.startTime;
      const total = vc.baseTime + elapsed;

      const totalMinutes = Math.floor(total / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return message.reply(
`🎬 VC CINEMA
━━━━━━━━━━━━━━━
⏱️ ${hours}h ${minutes}m
👥 ${channel.members.size} personas`
      );
    }

    // ♻️ RESET
    if (cmd === 'resetvc') {
      if (message.author.id !== OWNER_ID) {
        return message.reply('❌ No tienes permiso');
      }

      if (!channel) return;

      delete data[channel.id];
      saveData();

      return message.reply('♻️ VC reiniciado');
    }

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(process.env.TOKEN);