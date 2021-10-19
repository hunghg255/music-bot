const { MessageEmbed, Util } = require('discord.js');
const { getLyrics, searchSong } = require('genius-lyrics-api');
const fs = require('fs');
const fetch = require('node-fetch');
const lyricsFinder = require('lyrics-finder');

const CONFIG = {
  prefix: '!!',
  prefixCache: '!!',
  ownersId: '336414283724226564',
  filters: [
    '3d',
    'bassboost',
    'echo',
    'karaoke',
    'nightcore',
    'vaporwave',
    'flanger',
    'gate',
    'haas',
    'reverse',
    'surround',
    'mcompand',
    'phaser',
    'tremolo',
    'earwax',
  ],
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
  botID: '<@!896827276828737547>',
  lyricsKEY: 'BBoCCvo0iS0mBg7c8quSrwzD4Ydp-FwoxD-FNMImqQ1vNjY12yp6FKn3twd4FYOv',
  ytck: 'SID=Cgjj_06dcs93EyCxGMVP4J1bimoxMJPFMLz-mjr7-aRjnapLmlt2zWtvDT_FlDvtCNhf0w.; __Secure-1PSID=Cgjj_06dcs93EyCxGMVP4J1bimoxMJPFMLz-mjr7-aRjnapLHfn5ZiPtq7JuDGtM2QC2jw.; __Secure-3PSID=Cgjj_06dcs93EyCxGMVP4J1bimoxMJPFMLz-mjr7-aRjnapLHKFzNlROmqgqjd8G2TLJcw.; HSID=AUfdEoT3sImdh4Ijt; SSID=AaLalmZ7n1IQMSG06; APISID=Hu0LddJjpQCRQhu4/AZEArws6OZZuAHprD; SAPISID=inhmzxsEqUObJGRg/ADh9CslVCrvGso10Q; __Secure-1PAPISID=inhmzxsEqUObJGRg/ADh9CslVCrvGso10Q; __Secure-3PAPISID=inhmzxsEqUObJGRg/ADh9CslVCrvGso10Q; LOGIN_INFO=AFmmF2swRQIhAKWslmtIgrYYU7ciOdcbeBmcm7WdsoXk50_sIMto_VdoAiAl4rOq5G6nDFgOHS-lPMtBEznzc38aavHfwLXYGuQYrQ:QUQ3MjNmeGJtMFJNQnRraFhQaHp4OFBESDg3RUt2TWIzQTR5VDdxQ1hEZUpGcEZZb2trSXBVcjlWclBmMlAxcUxwcVg4Zk5oQUNITjRxV0F1WE1LOHlyd1VkUVQ3Xy1Bc0VkZ1dYSUtvSDVxeEdxeDMzdU9yYVBLXzZUdmkzREh0Z1FMOUZJV0NxMjNqZ29vZzlZYjAtY1FNbG9ySmVaUHpn; VISITOR_INFO1_LIVE=QOpido1vAJg; PREF=tz=Asia.Saigon; YSC=95_RtNB4xUY; CONSISTENCY=AGDxDeN0B5oxF5BvEo9TNwNKSk-eqVK_fwMf0f_HmvCuo_2i1WbUcYMn4a2fuY2gzxwF6F-aRknAHtFEWwlHUxwtdSK3DwZ1nQXQ-43XJ66EWrSk9SJXCcVIcK9ZS57yK3QS9Txy9EWNoWFzof3Z3MRC; SIDCC=AJi4QfGDb3X2QcfsLQenjX0DG48gSCLBV0SXy-fwKMhjrPQFprxXvi1IebNavPVrQ1U7apNekA; __Secure-3PSIDCC=AJi4QfHikLmmsDfRJvfKV4t0ZDZdft_aoaOY-syFO9SwdM_IF7YzW6nFOyg9nhLBwz9s424fNg',
  wh: 'https://discord.com/api/webhooks/892943608360075285/wWVheioweyxWMNdJb0Ok17NxBWfuN_0_NPvD1EqUXvD-LSa7W3jXkuDI_iC3mQ0f5l0n',
};
module.exports.CONFIG = CONFIG;

const removeSpoiler = (str) => {
  return Util.escapeSpoiler(str);
};
module.exports.removeSpoiler = removeSpoiler;

const addReact = async (message) => {
  message.react(
    CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)]
  );
  message.react(
    CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)]
  );
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
    title: removeSpoiler(title) || ' ',
    description: removeSpoiler(description) || ' ',
  })
    .setColor(color)
    .setTimestamp()
    .setFooter(
      'H',
      'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
    );

  message.channel.send({ embeds: [embed] });
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

module.exports.getStatus = (queue) =>
  `Status: \`${queue.playing ? 'Playing' : 'Pause'}\`\nVolume: \`${
    queue.volume
  }\` | Filter: \`${queue.filters.join(', ') || 'OFF'}\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode === 2
        ? 'All Queue'
        : 'This Song'
      : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;
//message.guild.id
const resetSkip = async (id) => {
  const serverId = id;
  const path = `./data/skip-${serverId}.json`;

  if (!fs.existsSync(path)) {
    fs.writeFileSync(
      path,
      JSON.stringify({
        count: 0,
        userid: [],
      })
    );
  }
  let data = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
  data = JSON.parse(data);

  if (data && data.count == 0) return;

  data = {
    count: 0,
    userid: [],
  };

  fs.writeFileSync(path, JSON.stringify(data));
};
module.exports.resetSkip = resetSkip;

const swapPosition = (arr, x, y) => {
  const t = arr[x];
  arr[x] = arr[y];
  arr[y] = t;
};
module.exports.swapPosition = swapPosition;

const notifsError = async (err) => {
  if (!err) return;
  const body = {
    content: `**<@336414283724226564>**`,
    embeds: [
      {
        title: 'Music Sanity Bot',
        description: `${err || ' '}`,
        color: 16711680,
      },
    ],
  };

  try {
    const response = await fetch(CONFIG.wh, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {}
};
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
        .then(console.log)
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
        .then(console.log)
        .catch(console.error);
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};
module.exports.checkPermission = checkPermission;
