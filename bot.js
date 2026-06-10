const {
  Client,
  GatewayIntentBits
} = require('discord.js');

const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus
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

// 🔥 AUTO RECONNECT AL INICIAR
client.once('ready', async () => {
  console.log('Bot listo');

  try {
    if (data.voice) {
      const guild = await client.guilds.fetch(data.voice.guildId);
      const channel = await guild.channels.fetch(data.voice.channelId);

      if (channel) {
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfDeaf: false
        });

        console.log('Reconectado automáticamente al VC');

        setupVoiceReconnect(connection, channel, guild);
      }
    }
  } catch (err) {
    console.error('Error al reconectar:', err);
  }
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

// 🔥 SISTEMA DE RECONEXIÓN
function setupVoiceReconnect(connection, channel, guild) {

  connection.on('stateChange', async (_, newState) => {
   console.log('Voice State => ' + newState.status);
console.log(newState.status);

    if (
      newState.status === VoiceConnectionStatus.Disconnected ||
      newState.status === VoiceConnectionStatus.Destroyed
    ) {

      console.log('Intentando reconectar al VC...');

      setTimeout(() => {

  if (!data.voice) {
    console.log('Reconexión cancelada');
    return;
  }

  try {

    const existing = getVoiceConnection(guild.id);

          if (existing) {
            existing.destroy();
          }

          const newConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
          });

          console.log('Reconectado exitosamente');

          setupVoiceReconnect(newConnection, channel, guild);

        } catch (err) {
          console.error('Error reconectando:', err);
        }
      }, 5000);
    }
  });
}

client.on('messageCreate', async (message) => {
  try {

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    const channel = message.member?.voice?.channel;

    // 🔊 JOIN
    if (cmd === 'join') {

      if (message.author.id !== OWNER_ID) return;

      if (!channel) {
        return message.reply('Métete a un VC primero');
      }

      try {

        const existing = getVoiceConnection(message.guild.id);

        if (existing) {
          existing.destroy();
        }

        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: false
        });

        // 🔥 GUARDAR VC
        data.voice = {
          guildId: message.guild.id,
          channelId: channel.id
        };

        saveData();

        setupVoiceReconnect(connection, channel, message.guild);

        return message.reply('Entré al VC');

      } catch (err) {
        console.error(err);
        return message.reply('Error al entrar al VC');
      }
    }

    // 🔇 LEAVE
    if (cmd === 'leave') {

      if (message.author.id !== OWNER_ID) return;

      const connection = getVoiceConnection(message.guild.id);

      if (!connection) {
        return message.reply('No estoy en VC');
      }

      connection.destroy();

      delete data.voice;

      saveData();

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

      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        minutes >= 60 ||
        hours < 0 ||
        minutes < 0
      ) {
        return message.reply(
'❌ Uso inválido\nEjemplo: n.setvc 300\no\nn.setvc 300 15'
);
      }

      data[channel.id] = {
        baseTime: (hours * 60 + minutes) * 60000,
        startTime: Date.now()
      };

      saveData();

      return message.reply(
'✅ VC configurado\n⏱️ Tiempo base: ' + hours + 'h ' + minutes + 'm'
);
    }

    // ⏱️ VER VC
    if (cmd === 'vc') {

      if (!channel) {
        return message.reply('❌ No estás en un canal de voz');
      }

      const vc = data[channel.id];

      if (!vc) {
        return message.reply(
'❌ Este VC no tiene tiempo configurado\nUsa: n.setvc'
);
      }

      const elapsed = Date.now() - vc.startTime;
      const total = vc.baseTime + elapsed;

      const totalMinutes = Math.floor(total / 60000);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return message.reply(
'🎧 VC\n━━━━━━━━━━━━━━━\n⏱️ ' +
hours +
'h ' +
minutes +
'm\n👥 ' +
channel.members.size +
' personas'
);
    }

    // ♻️ RESET VC
    if (cmd === 'resetvc') {

      if (message.author.id !== OWNER_ID) {
        return message.reply('❌ No tienes permiso');
      }

      if (!channel) return;

      delete data[channel.id];

      saveData();

      return message.reply('♻️ VC reiniciado');
    }

    // ❤️ LOV
if (cmd === 'lov') {

  const target = message.mentions.users.first();

  if (!target) {
    return message.reply(
      '❌ Menciona a alguien\nEjemplo: n.lov @persona'
    );
  }

  const name =
    message.guild.members.cache.get(target.id)?.displayName ||
    target.username;

  const porcentaje = Math.floor(Math.random() * 101);

  let frase = [];

  if (porcentaje <= 20) {

    frase = [
      'Hoy ' + name + '... mejor ni te emociones 😬',
      name + ' anda bien distante hoy 👀',
      'Uy... ' + name + ' mejor nada 💀',
      name + ' hoy no trae ganas la neta 😅',
      'Se siente frío el asunto con ' + name + ' 🥶'
    ];

  } else if (porcentaje <= 40) {

    frase = [
      name + ' te quiere... pero leve 😬',
      'Hoy ' + name + ' anda raro contigo 🤨',
      'No es el mejor día con ' + name + ' pero tampoco el peor',
      name + ' está dudando hoy 👀',
      name + ' no anda muy convencid@'
    ];

  } else if (porcentaje <= 60) {

    frase = [
      'Relación estable con ' + name + ' 😌',
      name + ' te quiere, pero lo normal 😅',
      'Todo tranquilo con ' + name,
      'Definitivamente hay algo 👀'
    ];

  } else if (porcentaje <= 80) {

    frase = [
      name + ' te quiere bastante 💘',
      'Se nota que ' + name + ' está feliz contigo 😎',
      'Hay conexión con ' + name + ' ✨',
      name + ' está bastante interesad@',
      'Todo fluye bien con ' + name + ' 😏'
    ];

  } else if (porcentaje < 100) {

    frase = [
      name + ' es el amor de tu vida 💖',
      'Ya casi no pueden vivir sin ti 😳',
      name + ' está perdidamente enamorad@ 💘',
      'Esto ya es cosa seria con ' + name + ' 🔥',
      'Amor eterno con ' + name
    ];

  } else {

    frase = [
      name + ' ya se quiere casar contigo 💍',
      'Esto ya es amor eterno con ' + name + ' ❤️‍🔥',
      name + ' está completamente perdid@ por ti 😳',
      'Ya valiste... ' + name + ' es todo tuyo 💖',
      'Nivel máximo: amor infinito con ' + name
    ];
  }

  const mensaje =
    frase[Math.floor(Math.random() * frase.length)];

    return message.reply(
    '❤️ Nivel de amor: ' + porcentaje + '%\n💬 ' + mensaje
  );
}

} catch (err) {
  console.error("ERROR:", err);
}
});

console.log("TOKEN existe:", !!process.env.TOKEN);
client.login(process.env.TOKEN);
