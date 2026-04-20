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

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        console.log("Entré al VC automáticamente");

    } catch (error) {
        console.error("Error al entrar al VC:", error);
    }
});