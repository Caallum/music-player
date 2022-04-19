# IMPORTANT INFORMATION:
# DO NOT EDIT FILE UNLESS YOU KNOW WHAT YOU'RE DOING
# 
# ERRORS MAY OCCUR, THIS IS NOT DUE TO THE CODE AND IS DUE TO THE FACT THAT YOU DO NOT HAVE A SPOTIFY CLIENT ID, SPOTIFY CLIENT SECRET OR A YOUTUBE COOKIE
# TO FIX THESE ISSUES, GO TO musicPlayer.js THIS WILL PROVIDE A MORE UNLOCKED VERSION THAT WILL NOT BE RATELIMITED OR PROVIDE ANY ISSUES

import { DisTube } from 'distube';
import { YouTubeDLPlugin } from '@distube/yt-dlp';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { MessageEmbed } from 'discord.js';
import config from './config.js';


export default class musicPlayer {
    constructor(client) {
        this.client = client;
        this.player = new DisTube(this.client, {
            youtubeDL: false,
            plugins: [
                new YouTubeDLPlugin({
                    updateYouTubeDL: true
                }),
                new SpotifyPlugin({
                    emitEventsAfterFetching: true,
                }),
                new SoundCloudPlugin()
            ],
            leaveOnFinish: true,
            leaveOnEmpty: true
        });
        this.events();
    }

    async embed(title, description, interaction, ephemeral = false) {
        const embedConstruct = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(config.color);
        interaction.reply({ embeds: [embedConstruct], ephemeral: ephemeral });
    }

    async play(interaction) {
        let query = interaction.options.getString("query");
        if(!query) return this.embed(`Something went wrong...`, "", interaction, true);
        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(interaction.guild?.me?.voice?.channel && voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`, "", interaction, true)

        this.player.play(voiceChannel, query, {
            member: interaction.member,
            textChannel: interaction.channel
        });

        this.embed(`Working`, "", interaction)
        await interaction.deleteReply();
    }

    async stop(interaction) {
        if(interaction.member.roles.cache.has("936345890543788082")) return this.embed(`You do not have permission to do that!`, "", interaction, true);

        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`,"", interaction, true);

        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        this.player.pause(interaction.guild.id)
        this.embed(`Music Player has been stopped`, "", interaction);
    }

    async resume(interaction) {
        if(interaction.member.roles.cache.has("936345890543788082")) return this.embed(`You do not have permission to do that!`, "", interaction, true);

        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`,"", interaction, true);

        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        this.player.resume(interaction.guild.id);
        this.embed(`Music Player has been resumed`, "", interaction)
    }
    
    async skip(interaction) {
        if(interaction.member.roles.cache.has("936345890543788082")) return this.embed(`You do not have permission to do that!`, "", interaction, true);

        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`,"", interaction, true);

        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        this.player.skip(interaction.guild.id);

        this.embed(`Working...`, "", interaction)
        await interaction.deleteReply();
    }

    async leave(interaction) {
        if(interaction.member.roles.cache.has("936345890543788082")) return this.embed(`You do not have permission to do that!`, "", interaction, true);

        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`,"", interaction, true);

        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        this.player.stop(interaction.guild.id);
        this.embed(`Music Player has been destroyed and bot has left voice channel`, "", interaction)
    }

    async volume(interaction) {
        let volume = interaction.options.getNumber("percentage");
        if(!volume) return this.embed(`Something went wrong, try again later`, "", interaction, true);

        if(interaction.member.roles.cache.has("936345890543788082")) return this.embed(`You do not have permission to do that!`, "", interaction, true);

        let voiceChannel = interaction.member?.voice?.channel;
        if(!voiceChannel) return this.embed(`First join a voice channel to use this command!`, "", interaction, true);
        if(voiceChannel.id != interaction.guild?.me?.voice?.channel?.id) return this.embed(`I am already in a voice channel! Join the one I am already in to use this command`,"", interaction, true);

        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        this.player.setVolume(interaction.guild.id, Number(volume));
        interaction.reply({ content: `Volume set to \`${volume}%\``})
    }

    async current(interaction) {
        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        let queue = await this.player.getQueue(interaction.guild.id);
        let song = queue.songs[0];

        let embed = new MessageEmbed()
            .setThumbnail(song.thumbnail)
            .addField(`Song Title:`, song.name, true)
            .addField(`Song Link:`, song.url, true)
            .addField(`Channel:`, song.uploader.name, true)
            .addField(`Duration:`, song.formattedDuration, true)
            .addField(`Requested By:`, song.user.tag, true)
            .setColor(config.color);
        interaction.reply({ embeds: [embed], ephemeral: true })
    }

    async events() {
        this.player
            .on("error", (channel, error) => {
                console.log(error);
                channel.send(`An error has occured... \`\`\`${error}\`\`\``);
            })
            .on("addSong", (queue, song) => {
                const embed = new MessageEmbed()
                    .setTitle(`${song.name}`)
                    .setColor(config.color)
                    .setURL(song.url)
                    .setThumbnail(song.thumbnail)
                    .setDescription(`Added **${song.name}** by **${song.uploader.name}**`)
                    .addField(`**Requested By:**`, song.user.toString(), true)
                    .addField(`**Position in Queue:**`, `${queue.songs.length ?? '0'}`, true);
                queue.textChannel.send({ embeds: [embed] });
            })
            .on("playSong", (queue, song) => {
                const embed = new MessageEmbed()
                    .setTitle(song.name)
                    .setURL(song.url)
                    .setColor(config.color)
                    .setThumbnail(song.thumbnail)
                    .setDescription(`Now playing **${song.name}** by **${song.uploader.name}**`)
                    .addField(`**Requested By:**`, song.user.toString(), true)
                    .addField(`**Queue Length:**`, `${queue.songs.length ?? "0"}`, true);
                queue.textChannel.send({ embeds: [embed] })
            })
            .on("addList", (queue, playlist) => {
                queue.textChannel.send({ embeds: [new MessageEmbed().setTitle(`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to the queue!`).setColor(config.color)]})
            })
            .on("empty", (queue) => queue.textChannel.send({ embeds: [new MessageEmbed().setTitle(`No one is left in the channel`).setColor(config.color)]}))
            .on("finish", (queue) => queue.textChannel.send({ embeds: [new MessageEmbed().setTitle(`There is no more songs left in the queue`).setColor(config.color)]}))
            .on("initQueue", (queue) => {
                queue.autoplay = false;
                queue.volume = 100;
            })
    }

    async queue(interaction) {
        let queue = await this.player.getQueue(interaction.guild.id);
        if(!await this.player.getQueue(interaction.guild.id)) return this.embed(`Music Player is currently not playing anything`, "", interaction, true);

        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Current Queue")
                    .setColor(config.color)
                    .setDescription(queue.songs.map((song, id) =>
            `**${id+1}. ${song.name}** requested by ${song.user.toString()}`
        ).join("\n"))
            ], ephemeral: true 
        })
    }
}
