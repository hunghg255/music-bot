const Discord = require('discord.js');
const Distube = require('distube');
const fs = require('fs');
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");

const { keepAlive } = require('./keep-alive.js');
const { CONFIG, isPermsDJ, notifsError, formatMsg, checkPermission, removeSpoiler, formatDuration } = require('./utils/index.js');
const filters = require('./data/filters.json');

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES
  ],
  partials: ['CHANNEL']
});

client.distube = new Distube.default(client, {
  emitNewSongOnly: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  emitAddSongWhenCreatingQueue: false,
  searchSongs: 0,
  emptyCooldown: 25,
  plugins: [new SpotifyPlugin({
    parallel: true,
    emitEventsAfterFetching: true,
    api: {
      clientId: process.env.S_ID,
      clientSecret: process.env.S_SC,
    },
  }), new SoundCloudPlugin()],
  youtubeDL: true,
  updateYouTubeDL: false,
  youtubeCookie: CONFIG.ytck,
  ytdlOptions: {
    highWaterMark: 1024 * 1024 * 64,
    quality: "highestaudio",
    format: "audioonly",
    liveBuffer: 60000,
    dlChunkSize: 1024 * 1024 * 64,
  },
  customFilters: filters,
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.prefix = {};

const PATH_PREFIX = './data/prefix.json';
const PATH_CUSTOM_ROLES = './data/customroles.json';

const PATH_COMMANDS = ['./commands/ownersbot/', './commands/admin/', './commands/dj/', './commands/member/', './commands/help/']

// Generate commads
for (let c = 0; c < PATH_COMMANDS.length; c++) {
  fs.readdir(PATH_COMMANDS[c], async (err, files) => {
    if (err) return console.log("Could not find any commands!");
    const jsFiles = files.filter(f => f.split(".").pop() === "js");
    if (jsFiles.length <= 0) return console.log("Could not find any commands!");
    console.log('________________________________________________');
    for (let i = 0; i < jsFiles.length; i++) {
      const file = jsFiles[i];
      const cmd = require(`${PATH_COMMANDS[c]}${file}`);
      console.log(`File: ${PATH_COMMANDS[c]}${file}`);
      client.commands.set(cmd.name, cmd);
      if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias.trim(), cmd.name));
    }
  });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const arr = [
    `${client.guilds.cache.size} servers`,
    `${client.users.cache.size} users`,
  ];

  let idx = 0;
  setInterval(() => {
    if (idx === arr.length) idx = 0;
    client.user.setActivity(`| ${arr[idx]}`, { type: 'LISTENING' });
    idx++;
  }, 3000);

  client.prefix = {};
  const server = client.guilds.cache.map((sv) => {
    sv.members.guild.fetchOwner().then(data => {
      console.log({
        id: sv.id,
        name: sv.name,
        ownerInfo: `${data.user.username}#${data.user.discriminator} - ${data.user.id}`
      })
    });

    return {
      id: sv.id,
      name: sv.name,
    }
  });

  if (!fs.existsSync(PATH_PREFIX)) {
    fs.writeFileSync(PATH_PREFIX, JSON.stringify({}));
  }
  let data = fs.readFileSync(PATH_PREFIX,{encoding:'utf8', flag:'r'});
  data = JSON.parse(data);
  let newData = {};
  client.filters = {};
  for (let i = 0; i < server.length; i++) {
    let sv = server[i];
    if (!data[sv.id]) {
      newData[sv.id] = CONFIG.prefix;
    } else {
      newData[sv.id] = data[sv.id];
      client.prefix[sv.id] = data[sv.id];
      client.filters[sv.id] = filters;
    }
  }

  fs.writeFileSync(PATH_PREFIX, JSON.stringify(newData));

  if (!fs.existsSync(PATH_CUSTOM_ROLES)) {
    fs.writeFileSync(PATH_CUSTOM_ROLES, JSON.stringify({}));
  }
});

client.on('messageCreate', async message => {
  if(message.author.bot) return;

  if (message.channel.type === 'DM') {
    const content = message.content;
    const files = message.attachments.map((val) => val.attachment).join('\n');
    // message.author.send(formatMsg(`You just need to mention me for the current prefix, DM me if you see an error, Thank you very much`));
    await notifsError(`${message.author} - \`${message.author.username}#${message.author.discriminator}\`\n ${message.content} \n ${files}`);
    return;
  }

  const isPermistion = checkPermission(message);
  if (isPermistion) return;

  if(!message.guild) return;
  const serverId = message.guild.id;

  // check custom roles

  if (!client[`cr${serverId}`]) {
    let dataCR = fs.readFileSync(PATH_CUSTOM_ROLES, {encoding:'utf8', flag:'r'});
    dataCR = JSON.parse(dataCR);
    if (dataCR[serverId]) {
      client[`cr${serverId}`] = dataCR[serverId];
    } else {
      client[`cr${serverId}`] = [];
    }
  }

  // check prefix
  if (!client.prefix) client.prefix = {};
  if (!client.prefix[serverId]) {
    let data = fs.readFileSync(PATH_PREFIX, { encoding: 'utf8', flag: 'r' });
    data = JSON.parse(data);
    if (data && data[serverId]) {
      client.prefix[serverId] = data[serverId];
    } else {
      client.prefix[serverId] = CONFIG.prefixCache;
    }
  }
  const prefix = client.prefix[serverId];
  CONFIG.prefix = client.prefix[serverId];

  if (message.content.includes(client.user.id)) {
    return message.channel.send(formatMsg(`Please use \`${CONFIG.prefix}help\` to show all commands`)).catch(console.error);
  }

  // search list
  if (client[`search-${message.author.id}`] && client[`author-${message.author.id}`]) {
    if (client[`author-${message.author.id}`] === message.author.id) {
      const isDj = await isPermsDJ(client, message);
      const queue = client.distube.getQueue(message);

      if (queue) {
        const listSongsUserSelect = queue.songs.filter((song) => {
          return song.user.id === message.author.id;
        })
        if (!isDj && listSongsUserSelect.length >= 3) {
          client[`search-${message.author.id}`] = null;
          client[`author-${message.author.id}`] = null;
          return message.channel.send(formatMsg(`You can only add up to 3 songs, You need a \`DJ\` role to add more songs`)).catch(console.error);
        }
      }

      const numberSongs = message.content.split(' ');
      if (
        numberSongs.length === 1 &&
        +numberSongs[0] >= 0 &&
        +numberSongs[0] <= client[`search-${message.author.id}`].length
      ) {
        if (+numberSongs[0] === 0) {
          message.channel.send(formatMsg(`Searching canceled.`)).catch(console.error);
          client[`search-${message.author.id}`] = null;
          client[`author-${message.author.id}`] = null;
          clearTimeout(client[`time-${message.author.id}`]);
          client[`time-${message.author.id}`] = 0;
          return;
        }
        message.channel.send(
          formatMsg(`Selected \`${numberSongs[0]}\` success.`)
        ).catch(console.error);
        const songSelect = client[`search-${message.author.id}`][+numberSongs[0] - 1];
        client.distube.play(message, songSelect);
        client[`search-${message.author.id}`] = null;
        client[`author-${message.author.id}`] = null;
        clearTimeout(client[`time-${message.author.id}`]);
        client[`time-${message.author.id}`] = 0;
        return;
      }

      if (numberSongs.length > 1 && isDj) {
        const songSelectedIdx = [];
        const songSelect = client[`search-${message.author.id}`].filter((v, idx) => {
          const isSelect = numberSongs.includes(`${idx + 1}`);
          if (isSelect) {
            songSelectedIdx.push(idx + 1);
          }
          return isSelect;
        });
        if (songSelect.length === 0) {
          return message.channel.send(formatMsg(`Please type from 1 to 10 or type 0 to cancel the search.`)).catch(console.error);
        }

        message.channel.send(
          formatMsg(`Selected \`${songSelectedIdx.join(', ')}\` success.`)
        ).catch(console.error);

        client[`selectmulti-${serverId}`] = true;
        client.distube.playCustomPlaylist(message, songSelect);
        client[`search-${message.author.id}`] = null;
        client[`author-${message.author.id}`] = null;
        clearTimeout(client[`time-${message.author.id}`]);
        client[`time-${message.author.id}`] = 0;
        return;
      } else if (numberSongs.length > 1 && !isDj) {
         return message.channel.send(formatMsg(`You need a \`DJ\` role to select multi songs!`)).catch(console.error);
      }
      message.channel.send(formatMsg(`Please type from 1 to 10 or type 0 to cancel the search.`)).catch(console.error);
    }
    return;
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);

  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(client.aliases.get(command));

  if (!cmd) return;

  if (cmd.inVoiceChannel && !message.member.voice.channel) {
    return message.channel.send(formatMsg(`You must be in a voice channel!`))
      .catch(console.error);
  }

  try {
    cmd.run({ client, message, args });
  } catch (e) {
    console.error(e)
  }
});

client.on('error', async (err) => {
  await notifsError(`${err.name}: ${err.message}`);
});

//distube
client.distube
  .on("playSong", (queue, song) => {
    try {
      const embed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Playing new Song')
        .setDescription(`**${removeSpoiler(song.name)}**\n\n**Duration:** \`${song.formattedDuration}\`\n**Requested by:** ${song.user}`)
        .setTimestamp()
        .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

      queue.textChannel.send({embeds: [embed]})
        .catch(console.error);
    } catch(err) {}
  })
  .on("addSong", (queue, song) => {
    let position;
    let estimateTime = formatDuration(queue.duration - queue.currentTime - song.duration);
    if (queue.songs.length > 1) {
      position = queue.songs.length - 1;
    }
    if (queue.songs.length > 1 && client.isPlayTop) {
      position = 1;
      estimateTime = formatDuration(queue.songs[0].duration - queue.currentTime);
    }
    client.isPlayTop = false;

    const embed = new Discord.MessageEmbed()
      .setColor('#ffec13')
      .setTitle('Added new Song')
      .setDescription(`**${removeSpoiler(song.name)}**\n\n${position ? `**Position:** \`${position}\`` : ''}\n**Duration:** \`${song.formattedDuration}\`\n**Estimated time until playing:** \`${estimateTime}\`\n**Requested by:** ${song.user}`)
      .setTimestamp()
      .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    queue.textChannel.send({embeds: [embed]})
      .catch(console.error);
  })
  .on("addList",  (queue, playlist) => {
    if (client[`selectmulti-${queue.clientMember.guild.id}`]) {
      client[`selectmulti-${queue.clientMember.guild.id}`] = false;
      return;
    }
    queue.textChannel.send(
    formatMsg(`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to the queue!`
    )).catch(console.error);
  })
  .on("searchResult", (message, result) => {
    let i = 0;
     const embed = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle('')
      .setDescription(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n\n*Enter anything else or wait 60 seconds to cancel*`)
      .setTimestamp();

    message.channel.send({embeds: [embed]})
      .catch(console.error);
  })
  .on("searchNoResult", (message, query) => message.channel.send(`No result found for ${query}!`).catch(console.error))
  .on('searchInvalidAnswer', message =>
		message.channel.send(`searchInvalidAnswer`).catch(console.error))
  .on("searchCancel", (message) =>  {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('')
      .setDescription(`Searching canceled`)
      .setTimestamp();

    message.channel.send({embeds: [embed]})
      .catch(console.error);
  })
  .on("finishSong", (queue, song) => {
    client[`skip-${queue.clientMember.guild.id}`] = null;
  })
  .on("finish", queue => queue.textChannel.send(formatMsg("No more song in queue")).catch(console.error))
  .on("empty", queue => queue.textChannel.send(formatMsg("Channel is empty. Leaving the channel")).catch(console.error))
  .on('disconnect', queue => queue.textChannel.send(formatMsg('Disconnected!')).catch(console.error))
  .on("error", async (channel, err) => {
    let newErr = err;
    if (err && err.errorCode && err.errorCode.includes('VOICE_MISSING_PERMS')) {
      newErr = `**I do not have permission to join this voice channel**`;
    }
    if (err && err.errorCode && err.errorCode.includes('VOICE_FULL')) {
      newErr = `**The voice channel is full**`;
    }
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle(' ')
      .setDescription(`${newErr}`)
      .setTimestamp();

    channel.send({embeds: [embed]}).catch(console.error);
    await notifsError(err);
  })
  .on("initQueue", queue => {
    queue.volume = 100;
    queue.autoplay = true;
    queue.setFilter([`bassboost6`]);
});

keepAlive();
client.login(process.env.TOKEN);

process.on("uncaughtException", async (err) => {
	console.error("There was an uncaught error", err);

  await notifsError(err);
  process.exit();
});
