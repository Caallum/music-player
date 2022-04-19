import musicClient from './musicPlayer.js';
import discord from 'discord.js';

const client = new discord.Client({ intents: [ discord.Intents.FLAGS.GUILD_VOICE_STATES, discord.Intents.FLAGS.GUILDS ]});
const musicClient = new musicClient(client);

client.on("interactionCreate", async (interaction) => {
  if(interaction.commandName == "play") {
    musicClient.play(interaction); 
  };
});
