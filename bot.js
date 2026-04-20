console.log("INICIANDO...");

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch("1476366375218843713");

    if (!channel) {
      console.log("No encontré el canal");
      return;
    }

    if (!channel.isVoiceBased()) {
      console.log("El canal no es de voz");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // Evita crash y confirma conexión
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

    console.log("Entré al VC automáticamente");

    connection.on('error', (e) => {
      console.error("Error de conexión VC:", e);
    });

  } catch (error) {
    console.error("Error general al entrar al VC:", error);
  }
});

client.on('error', (err) => {
  console.error("Error cliente:", err);
});

process.on('unhandledRejection', (err) => {
  console.error("UnhandledRejection:", err);
});

process.on('uncaughtException', (err) => {
  console.error("UncaughtException:", err);
});

client.login(process.env.TOKEN)
  .then(() => console.log("LOGIN OK"))
  .catch(err => console.error("ERROR LOGIN:", err));