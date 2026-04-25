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

let data = {};
if (fs.existsSync(FILE)) {
  data = JSON.parse(fs.readFileSync(FILE));
}

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

    // 🔊 JOIN (ARREGLADO)
    if (cmd === 'join') {
      if (message.author.id !== OWNER_ID) return;
      if (!channel) return message.reply('Métete a un VC primero');

      const existing = getVoiceConnection(message.guild.id);

      // 🔥 FIX: ya no destruimos conexión, evitamos conflicto
      if (existing) {
        return message.reply('Ya estoy conectado en este server');
      }

      try {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: false
        });

        return message.reply('Entré al VC');
      } catch (err) {
        console.error(err);
        return message.reply('Error al entrar al VC');
      }
    }

    // 🔇 LEAVE (igual)
    if (cmd === 'leave') {
      if (message.author.id !== OWNER_ID) return;

      const connection = getVoiceConnection(message.guild.id);
      if (!connection) return message.reply('No estoy en VC');

      connection.destroy();
      return message.reply('Me salí');
    }

    // 🎬 SET VC (igual)
    if (cmd === 'setvc') {
      if (message.author.id !== OWNER_ID) return message.reply('❌ No tienes permiso');
      if (!channel) return message.reply('❌ Debes estar en un VC');
      if (args.length < 1) return message.reply('❌ Uso: n.setvc horas [minutos]');

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

    // ⏱️ VER VC (igual)
    if (cmd === 'vc') {
      if (!channel) return message.reply('❌ No estás en un canal de voz');

      const vc = data[channel.id];
      if (!vc) return message.reply('❌ Este VC no tiene tiempo configurado\nUsa: n.setvc');

      const elapsed = Date.now() - vc.startTime;
      const total = vc.baseTime + elapsed;

      const totalMinutes = Math.floor(total / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return message.reply(
`🎧 VC
━━━━━━━━━━━━━━━
⏱️ ${hours}h ${minutes}m
👥 ${channel.members.size} personas`
      );
    }

    // ♻️ RESET (igual)
    if (cmd === 'resetvc') {
      if (message.author.id !== OWNER_ID) return message.reply('❌ No tienes permiso');
      if (!channel) return;

      delete data[channel.id];
      saveData();

      return message.reply('♻️ VC reiniciado');
    }

    // 💘 LOV (TU VERSIÓN ORIGINAL intacta)
    if (cmd === 'lov') {
      const target = message.mentions.users.first();
      if (!target) {
        return message.reply('❌ Menciona a alguien\nEjemplo: n.amor @persona');
      }

      const name = message.guild.members.cache.get(target.id)?.displayName || target.username;
      const porcentaje = Math.floor(Math.random() * 101);

      let frase = "";

      if (porcentaje <= 20) {
        frase = [
          `Hoy ${name}… mejor ni te emociones 😬`,
          `${name} anda bien distante hoy 👀`,
          `Uy… ${name} mejor nada 💀`,
          `${name} hoy no trae ganas la neta 😅`,
          `Se siente frío el asunto con ${name} 🥶`
        ];
      } else if (porcentaje <= 40) {
        frase = [
          `${name} te quiere… pero leve 😬`,
          `Hoy ${name} anda raro contigo 🤨`,
          `No es el mejor día con ${name} pero tampoco el peor`,
          `${name} está dudando hoy 👀`,
          `${name} no anda muy convencid@`
        ];
      } else if (porcentaje <= 60) {
        frase = [
          `Relación estable con ${name} 😌`,
          `${name} te quiere, pero lo normal 😅`,
          `Todo tranquilo con ${name}`,
          `Definitivamente hay algo 👀`
        ];
      } else if (porcentaje <= 80) {
        frase = [
          `${name} te quiere bastante 💘`,
          `Se nota que ${name} está feliz contigo 😎`,
          `Hay conexión con ${name} ✨`,
          `${name} está bastante interesad@`,
          `Todo fluye bien con ${name} 😏`
        ];
      } else if (porcentaje < 100) {
        frase = [
          `${name} es el amor de tu vida 💖`,
          `Ya casi no pueden vivir sin ti 😳`,
          `${name} está perdidamente enamorad@ 💘`,
          `Esto ya es cosa seria con ${name} 🔥`,
          `Amor eterno con ${name}`
        ];
      } else {
        frase = [
          `${name} ya se quiere casar contigo 💍`,
          `Esto ya es amor eterno con ${name} ❤️‍🔥`,
          `${name} está completamente perdid@ por ti 😳`,
          `Ya valiste… ${name} es todo tuyo 💖`,
          `Nivel máximo: amor infinito con ${name}`
        ];
      }

      const mensaje = frase[Math.floor(Math.random() * frase.length)];

      return message.reply(
`❤️ Nivel de amor: ${porcentaje}%
💬 ${mensaje}`
      );
    }

  } catch (err) {
    console.error("ERROR:", err);
  }
});

client.login(process.env.TOKEN);