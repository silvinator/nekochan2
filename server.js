const Discord = require('discord.js');
const client = new Discord.Client();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube(process.env.TOKENYT);
const queue = new Map();
const config = require('./config.json');
const util = require('util');
const fs = require ("fs");
const mysql = require("mysql");


const prefix = config.prefix;
const ownerID= config.ownerid;
const servers = {};
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });

});

function generateXP() {
    
    let min = 10;
    let max = 30;
    return Math.floor(math.random() * (max - min + 1)) + min ;
}

let xpAdd = Math.floor(Math.random() * 7) + 8;
console.log(xpAdd);

if (!xp[message.author.id]) {
    xp[message.author.id] = {
        xp: 0,
        level: 1
    };
}


let curxp = xp[message.author.id].xp;
let curlvl = xp[message.author.id].level;
let nxtLvl = xp[message.author.id].level * 300;
xp[message.author.id].xp = curxp + xpAdd;
if (nxtLvl <= xp[message.author.id].xp) {
    xp[message.author.id].level = curlvl + 1;
    let lvlup = new Discord.RichEmbed()
        .setTitle(`Ohne ich wärst du nie Aufgelevelt ${message.author}!`)
        .setColor("#08ff00")
        .addField("Du bist jetzt", curlvl + 1);

    message.channel.send(lvlup).then(msg => {
        msg.delete(5000)
    });
}
fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
            if (err) console.log(err)


bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;
    
  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args, con);
    
  

});




client.on('ready', () => { //Wenn der Bot gestartet ist, macht er dies
    client.user.setActivity('Mit Silver <3');
	  client.user.setStatus('online');
    console.log(`Bot is online!\n${client.users.size} users, in ${client.guilds.size} servers connected.`);
});

client.on("message", async message => {
    var args = message.content.substring(prefix.length).split(" ");
    if (!message.content.startsWith(prefix)) return;
  var searchString = args.slice(1).join(' ');
	var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	var serverQueue = queue.get(message.guild.id);
    switch (args[0].toLowerCase()) {
      case "play":
    var voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send(`Du willst mit mir Karaoke singen? Da ich eh nichts besseres zu tun habe. Du suchst aber den Voice Channel aus!`);
		var permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			var playlist = await youtube.getPlaylist(url);
			var videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				var video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return message.channel.send(`Ich habe wohl keine andere wahl... Ich habe **${playlist.title}** der playlist zugefügt`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					var index = 0;
					var videoIndex = 1;
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return message.channel.send('Gibt es den Song überhaupt?');
				}
			}
			return handleVideo(video, message, voiceChannel);
		}
break;
      case "skip":
		if (!message.member.voiceChannel) return message.channel.send('Du musst schon in den Voice Channel gehen, baka!');
		if (!serverQueue) return message.channel.send('Du musst schon ein song auswählen, baka!');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
        break;
      case "stop":
		if (!message.member.voiceChannel) return message.channel.send('Du musst schon in den Voice Channel gehen, baka!');
		if (!serverQueue) return message.channel.send('Du musst schon einen Song auswählen, baka');
    serverQueue.connection.dispatcher.end('Stop command has been used!');
		serverQueue.songs = [];
		return undefined;
break;
      case "minfo":
		if (!serverQueue) return message.channel.send('Ich spiele immer noch nichts!');
		return message.channel.send(`🎶 Ich sage es dir nur, da ich keine andere wahl habe! **${serverQueue.songs[0].title}** (${serverQueue.songs[0].url})`);
break;
      case "mliste":
		if (!serverQueue) return message.channel.send('Du hast schon alle Songs gehört, wie soll ich dir dann welche zeige, baka');
		return message.channel.send(`
Wenn es sein muss, aber ich mache das nicht für dich:
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Jetzt:** ${serverQueue.songs[0].title}
		`);
break;
      case "pause":
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send('');
		}
		return message.channel.send('Was soll ich pausieren? Deine Dummheit?');
break;
      case "resume":
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send('Ich habe die Musik nicht für dich wiedergegeben!');
		}
		return message.channel.send('Was soll ich fortsetzen?');
	

	return undefined;
break;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
	var serverQueue = queue.get(message.guild.id);
	console.log(video);
	var song = {
		id: video.id,
		title: video.title,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		var queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return message.channel.send(`Ich habe **${song.title}** schon in meiner playlist gehabt! Denk ja nicht das du was damit zu tun hast!`);
	}
	return undefined;
}
  function play(guild, song) {
	var serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`Ich spiele **${song.title}** (${song.url}) nur weil ich es will. Das du es auch willst ist nur ein zufall!`);
}
});

client.on("guildMemberAdd", function(member) {
  
  let roleremove = member.guild.roles.find("name", "Rule");
  let rolejoin = member.guild.roles.find("name", "Mitglieder");
  member.addRole(roleremove).catch(console.error);
  member.send(`Ich habe wohl keine andere wahl als dir das zu sagen ${member}!\n Du hast 1 minute zeit dir die Regeln durchzulesen. Bis dahin kannst du nichts anderes machen!`);
  setTimeout(function(){
    member.addRole(rolejoin).catch(console.error);
    member.removeRole(roleremove).catch(console.error);
  }, 60000);
  
});


client.login(process.env.TOKEN);
