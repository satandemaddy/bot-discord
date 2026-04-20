console.log("ARRANCANDO BOT...");

require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', async () => {
    console.log(`Bot listo como ${client.user.tag}`);

    const channel = client.channels.cache.get("1476366375218843713");

    if (!channel) return console.log("No encontré el canal");

    joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    console.log("Entré al VC automáticamente");
});

client.login(process.env.TOKEN)
    .then(() => console.log("LOGIN OK"))
    .catch(err => console.error("ERROR LOGIN:", err));