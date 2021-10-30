const { MessageEmbed, Util } = require('discord.js');
const { getLyrics, searchSong } = require('genius-lyrics-api');
const fetch = require('node-fetch');
const lyricsFinder = require('lyrics-finder');

const CONFIG = {
  prefix: '!!',
  prefixCache: '!!',
  emojis: [
    '💖',
    '🥰',
    '😍',
    '❤️‍🔥',
    '😘',
    '😊',
    '💕',
    '🙉',
    '😻',
    '💟',
    '💙',
    '🧡',
    '💛',
    '💚',
    '💜',
    '👏',
    '🙌',
    '🙋‍♂️',
    '🙋',
    '🤗',
    '❣️',
    '🙏',
    '🤭',
    '🤩',
    '👀',
  ],
  lyricsKEY: '',
  ytck: '',
  wh: '',
};
module.exports.CONFIG = CONFIG;

const removeSpoiler = (str) => {
  return Util.escapeSpoiler(str);
};
module.exports.removeSpoiler = removeSpoiler;

const addReact = async (message) => {
  message
    .react(CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)])
    .catch(console.error);
};
module.exports.addReact = addReact;

const getAllRole = async (message) => {
  const user = message.author;
  const member = message.guild.members.cache.get(user.id);
  const rolesName = member.roles.cache
    .map((item) => {
      return item.name;
    })
    .map((i) => i.toLowerCase());
  const rolesId = member.roles.cache.map((item) => {
    return item.id;
  });
  return { rolesName, rolesId };
};
module.exports.getAllRole = getAllRole;

const isPermsDJ = async (client, message) => {
  const { rolesName, rolesId } = await getAllRole(message);
  const serverId = message.guild.id;

  const isDJ = client[`cr${serverId}`].find(
    (djPerms) =>
      rolesName.includes(djPerms.toLowerCase()) || rolesId.includes(djPerms)
  );
  if (isDJ && isDJ.length > 0) return true;
  if (rolesName.includes('dj')) return true;
  return false;
};
module.exports.isPermsDJ = isPermsDJ;

const getEmbedMsg = (message, color, title, description) => {
  const embed = new MessageEmbed({
    title: removeSpoiler(title || '') || ' ',
    description: removeSpoiler(description || '') || ' ',
  })
    .setColor(color)
    .setTimestamp()
    .setFooter(
      'H',
      'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
    );

  message.channel.send({ embeds: [embed] }).catch(console.error);
};
module.exports.getEmbedMsg = getEmbedMsg;

const getLyric = async (songName, artist) => {
  const options = {
    apiKey: CONFIG.lyricsKEY,
    title: songName,
    artist: '  ',
    optimizeQuery: true,
  };
  const lyrics1 = await lyricsFinder(' ', songName);
  if (lyrics1) {
    return `**${songName}**\n\n${lyrics1}`;
  }

  const ly1 = await getLyrics(options);
  return ly1;
};
module.exports.getLyric = getLyric;

module.exports.getStatus = (queue, filters) => {
  return `Status: \`${queue.playing ? 'Playing' : 'Pause'}\`\nFilters: \`${
    queue.filters.filter((v) => v !== 'customspeed').join(', ') || 'Off'
  }\`\nVolume: \`${queue.volume}\` | Speed: \`${
    filters.customspeed.split('=')[1]
  }x\` | Loop: \`${
    queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Song') : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;
};

const swapPosition = (arr, x, y) => {
  const t = arr[x];
  arr[x] = arr[y];
  arr[y] = t;
};
module.exports.swapPosition = swapPosition;

const notifsError = async (err) => {};
module.exports.notifsError = notifsError;

const formatMsg = (msg) => {
  return `> **${msg}**`;
};
module.exports.formatMsg = formatMsg;

const checkPermission = (message) => {
  try {
    const permissions = message.channel.permissionsFor(message.guild.me);
    const permissionArr = permissions.toArray();

    if (!permissionArr.includes('SEND_MESSAGES')) {
      message.author
        .send(
          `${formatMsg(
            `Bots don't have permission \`SEND_MESSAGES\` in that channel`
          )}`
        )
        .catch(console.error);
      return true;
    }

    if (!permissionArr.includes('EMBED_LINKS')) {
      message.channel
        .send(
          `${formatMsg(
            `Bots don't have permission \`EMBED_LINKS\` in this channel`
          )}`
        )
        .catch(console.error);
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};
module.exports.checkPermission = checkPermission;

const progressBar = ({
  time,
  totalTime,
  timeFormat,
  totalTimeFormat,
  size = 15,
}) => {
  const percentage = time / totalTime;
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;

  const progressText = '▇'.repeat(progress);
  const emptyProgressText = '—'.repeat(emptyProgress);

  const bar = `${timeFormat} ${progressText}${emptyProgressText} ${totalTimeFormat}`;
  return bar;
};
module.exports.progressBar = progressBar;

const formatInt = (int) => (int < 10 ? `0${int}` : int);
function formatDuration(sec) {
  if (!sec || !Number(sec)) return '00:00';
  const seconds = Math.round(sec % 60);
  const minutes = Math.floor((sec % 3600) / 60);
  const hours = Math.floor(sec / 3600);
  if (hours > 0)
    return `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`;
  if (minutes > 0) return `${formatInt(minutes)}:${formatInt(seconds)}`;
  return `00:${formatInt(seconds)}`;
}
module.exports.formatDuration = formatDuration;
