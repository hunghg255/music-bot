const Discord = require('discord.js');
const Distube = require('distube');
const fs = require('fs');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
require('dotenv').config();

const { keepAlive } = require('./keep-alive.js');
const {
  resetSkip,
  CONFIG,
  getStatus,
  isPermsDJ,
  notifsError,
  formatMsg,
  checkPermission,
  removeSpoiler,
} = require('./utils/index.js');

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ['CHANNEL'],
});

client.distube = new Distube.default(client, {
  emitNewSongOnly: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  updateYouTubeDL: false,
  searchCooldown: 10,
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: false,
      api: {
        clientId: process.env.S_ID,
        clientSecret: process.env.S_SC,
      },
    }),
    new SoundCloudPlugin(),
  ],
  youtubeCookie: CONFIG.ytck,
  ytdlOptions: {
    highWaterMark: 1 << 24,
    quality: 'highestaudio',
  },
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.prefix = {};

const PATH_PREFIX = './data/prefix.json';
const PATH_CUSTOM_ROLES = './data/customroles.json';

const PATH_COMMANDS = [
  './commands/ownersbot/',
  './commands/admin/',
  './commands/dj/',
  './commands/member/',
  './commands/help/',
];

// Generate commads
for (let c = 0; c < PATH_COMMANDS.length; c++) {
  fs.readdir(PATH_COMMANDS[c], async (err, files) => {
    if (err) return console.log('Could not find any commands!');
    const jsFiles = files.filter((f) => f.split('.').pop() === 'js');
    if (jsFiles.length <= 0) return console.log('Could not find any commands!');
    console.log('________________________________________________');
    for (let i = 0; i < jsFiles.length; i++) {
      const file = jsFiles[i];
      const cmd = require(`${PATH_COMMANDS[c]}${file}`);
      console.log(`File: ${PATH_COMMANDS[c]}${file}`);
      client.commands.set(cmd.name, cmd);
      if (cmd.aliases)
        cmd.aliases.forEach((alias) =>
          client.aliases.set(alias.trim(), cmd.name)
        );
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
    sv.members.guild.fetchOwner().then((data) => {
      console.log({
        id: sv.id,
        name: sv.name,
        ownerInfo: `${data.user.username}#${data.user.discriminator} - ${data.user.id}`,
      });
    });

    return {
      id: sv.id,
      name: sv.name,
    };
  });

  if (!fs.existsSync(PATH_PREFIX)) {
    fs.writeFileSync(PATH_PREFIX, JSON.stringify({}));
  }
  let data = fs.readFileSync(PATH_PREFIX, { encoding: 'utf8', flag: 'r' });
  data = JSON.parse(data);
  let newData = {};

  for (let i = 0; i < server.length; i++) {
    let sv = server[i];
    if (!data[sv.id]) {
      newData[sv.id] = CONFIG.prefix;
    } else {
      newData[sv.id] = data[sv.id];
    }
  }

  fs.writeFileSync(PATH_PREFIX, JSON.stringify(newData));

  if (!fs.existsSync(PATH_CUSTOM_ROLES)) {
    fs.writeFileSync(PATH_CUSTOM_ROLES, JSON.stringify({}));
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.channel.type === 'DM') {
    const content = message.content;
    const files = message.attachments.map((val) => val.attachment).join('\n');
    // message.author.send(formatMsg(`You just need to mention me for the current prefix, DM me if you see an error, Thank you very much`));
    await notifsError(
      `${message.author} - \`${message.author.username}#${message.author.discriminator}\`\n ${message.content} \n ${files}`
    );
    return;
  }

  const isPermistion = checkPermission(message);
  if (isPermistion) return;

  if (!message.guild) return;
  const serverId = message.guild.id;

  // check custom roles

  if (!client[`cr${serverId}`]) {
    let dataCR = fs.readFileSync(PATH_CUSTOM_ROLES, {
      encoding: 'utf8',
      flag: 'r',
    });
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
      CONFIG.prefix = data[serverId];
    } else {
      CONFIG.prefix = CONFIG.prefixCache;
    }
  } else if (client.prefix[serverId]) {
    CONFIG.prefix = client.prefix[serverId];
  }

  if (message.content.includes(CONFIG.botID)) {
    return message.channel.send(
      formatMsg(`Please use \`${CONFIG.prefix}help\` to show all commands`)
    );
  }

  // search list
  if (client.searchList && client.authorSearch) {
    if (client.authorSearch.id === message.author.id) {
      const isDj = await isPermsDJ(client, message);
      const queue = client.distube.getQueue(message);

      if (queue) {
        const listSongsUserSelect = queue.songs.filter((song) => {
          return song.user.id === message.author.id;
        });
        if (!isDj && listSongsUserSelect.length >= 3) {
          client.searchList = null;
          client.authorSearch = null;
          return message.channel.send(
            formatMsg(
              `You can only add up to 3 songs, You need a \`DJ\` role to add more songs`
            )
          );
        }
      }

      if (
        +message.content > 0 &&
        +message.content <= client.searchList.length
      ) {
        message.channel.send(formatMsg(`Selected success.`));
        const songSelect = client.searchList[+message.content - 1];

        client.distube.play(message, songSelect);
        client.searchList = null;
        client.authorSearch = null;
      } else {
        message.channel.send(formatMsg(`Wrong postion!`));
      }
    }
    return;
  }

  const prefix = CONFIG.prefix;
  client.prefix = {
    ...client.prefix,
    [serverId]: CONFIG.prefix,
  };

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);

  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(client.aliases.get(command));

  if (!cmd) return;

  if (cmd.inVoiceChannel && !message.member.voice.channel)
    return message.channel.send(formatMsg(`You must be in a voice channel!`));

  try {
    cmd.run({ client, message, args });
  } catch (e) {
    console.error(e);
  }
});

client.on('error', async (err) => {
  await notifsError(`${err.name}: ${err.message}`);
});

//distube
client.distube
  .on('playSong', (queue, song) => {
    try {
      const embed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Playing new Song!')
        .setDescription(
          `**${removeSpoiler(song.name)}**  -  \`${
            song.formattedDuration
          }\` \nRequested by: ${song.user}\n\n${getStatus(queue)}`
        )
        .setTimestamp()
        .setFooter(
          'H',
          'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
        );

      queue.textChannel.send({ embeds: [embed] });
    } catch (err) {}
  })
  .on('addSong', (queue, song) => {
    let text = 'Added new Song.';
    if (queue.songs.length > 1) {
      text = `Added new Song. Position: ${queue.songs.length - 1}`;
    }
    if (queue.songs.length > 1 && client.isPlayTop) {
      text = `Added new Song. Position: 1`;
    }
    client.isPlayTop = false;
    const embed = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle(text)
      .setDescription(
        `**${removeSpoiler(song.name)}**  -  \`${
          song.formattedDuration
        }\`\nRequested by: ${song.user}\n\n`
      )
      .setTimestamp()
      .setFooter(
        'H',
        'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
      );

    queue.textChannel.send({ embeds: [embed] });
  })
  .on('addList', (queue, playlist) => {
    queue.textChannel.send(
      formatMsg(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to the queue!`
      )
    );
  })
  .on('searchResult', (message, result) => {
    let i = 0;
    const embed = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle('')
      .setDescription(
        `**Choose an option from below**\n${result
          .map(
            (song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
          )
          .join('\n')}\n\n*Enter anything else or wait 60 seconds to cancel*`
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  })
  .on('searchNoResult', (message, query) =>
    message.channel.send(`No result found for ${query}!`)
  )
  .on('searchInvalidAnswer', (message) =>
    message.channel.send(`searchInvalidAnswer`)
  )
  .on('searchCancel', (message) => {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('')
      .setDescription(`Searching canceled`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  })
  .on('finishSong', (queue, song) => {
    resetSkip(queue.clientMember.guild.id);
  })
  .on('finish', (queue) =>
    queue.textChannel.send(formatMsg('No more song in queue'))
  )
  .on('empty', (queue) =>
    queue.textChannel.send(formatMsg('Channel is empty. Leaving the channel'))
  )
  .on('disconnect', (queue) =>
    queue.textChannel.send(formatMsg('Disconnected!'))
  )
  .on('error', async (channel, err) => {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('An error encountered')
      .setDescription(`${err}`)
      .setTimestamp();

    channel.send({ embeds: [embed] });
    await notifsError(err);
  })
  .on('initQueue', (queue) => {
    queue.volume = 100;
    queue.autoplay = false;
  });

keepAlive();
client.login(process.env.TOKEN);

process.on('uncaughtException', async (err) => {
  console.error('There was an uncaught error', err);

  await notifsError(err);
  process.exit();
});
