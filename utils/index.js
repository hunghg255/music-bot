const { MessageEmbed, Util } = require('discord.js');
const { getLyrics, searchSong } = require('genius-lyrics-api');
const fetch = require('node-fetch');
const lyricsFinder = require('lyrics-finder');

const CONFIG = {
  prefix: '!!',
  prefixCache: '!!',
  emojis: ["💖", "🥰", "😍", "❤️‍🔥", "😘", "😊", "💕", "🙉", "😻", "💟", "💙", "🧡", "💛", "💚", "💜", "👏", "🙌", "🙋‍♂️", "🙋", "🤗", "❣️", "🙏", "🤭", "🤩", "👀"],
  lyricsKEY: 'BBoCCvo0iS0mBg7c8quSrwzD4Ydp-FwoxD-FNMImqQ1vNjY12yp6FKn3twd4FYOv',
  ytck: 'HSID=AUxwNFTkvAWVrh7XO; SSID=A2dYq1GTxb0qYb5b6; APISID=d6UCQ7mCbEqycwC_/AAzXJZI9_GOyR6shz; SAPISID=Nnn4VS-oK6gMjcLt/ALJawKVBP8DPAGS3n; __Secure-1PAPISID=Nnn4VS-oK6gMjcLt/ALJawKVBP8DPAGS3n; __Secure-3PAPISID=Nnn4VS-oK6gMjcLt/ALJawKVBP8DPAGS3n; LOGIN_INFO=AFmmF2swRQIgdZlg_Rzopa5xm4STsGPwBM3JUfyLiUi3U5kOQk3o5QMCIQCYYF8Ef4IWNi7Lnz0oZPw7GHcwd03_zfKDqP225f0Usg:QUQ3MjNmeWlzWE5qX21PUmRWQy0wemJRYVY1WjJiU25zdDRxeTJqck5Sb0czSnVqdmIxM21yZUxuUVl2T1pUdVlUeWxtTEhnc2lvUi1OdjZIdXpad2dWN2pEVDlQbTZFUXRHVnY3Rm56Rndoemt2R3hEZVJGckxlb3d4ZzdVYWJjRVphZ3lqUC1MUlBRYmo1TVJlNDJ4N2pVaXB2TmJtMDdB; VISITOR_INFO1_LIVE=knPkQ8XqkpE; SID=Cwh2Fvk_SwaAqEnzpyntpRcJPI6heIo8qV7W5f16BiFqD_KrW2F5M_LaLO0i73nCkxt4CA.; __Secure-1PSID=Cwh2Fvk_SwaAqEnzpyntpRcJPI6heIo8qV7W5f16BiFqD_KrlQYN10cnBlzbqSFpDAPpHA.; __Secure-3PSID=Cwh2Fvk_SwaAqEnzpyntpRcJPI6heIo8qV7W5f16BiFqD_Kr93Cqwv7dY9HIdTX_1Q-A8w.; YSC=TEnt51AoRjE; CONSISTENCY=AGDxDeN6lvlUnxYaT0JuIvnI8g6H_NJ2QPTDa4r0IUDlNEu7ACjh13WdJwzUrP0jj7h2p54KwASQMR1h94Ju0FBf0BcWy_brC_ci5mkNPUD4uiuvSaqlHySrJqdNF5TBUg7FqXas7J5V5t7BSNgu7I7K; PREF=tz=Asia.Saigon&gl=GB; ST-1q9ca8w=itct=CPsBEKQwGAEiEwjkscuasPHzAhUURg8CHe66B30yB3JlbGF0ZWRIqZr28sqCoIFGmgEFCAEQ-B0%3D&csn=MC43Mjc4NjQ3MTk5NzY3NTcy&endpoint=%7B%22clickTrackingParams%22%3A%22CPsBEKQwGAEiEwjkscuasPHzAhUURg8CHe66B30yB3JlbGF0ZWRIqZr28sqCoIFGmgEFCAEQ-B0%3D%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2Fwatch%3Fv%3DJGwWNGJdvx8%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_WATCH%22%2C%22rootVe%22%3A3832%7D%7D%2C%22watchEndpoint%22%3A%7B%22videoId%22%3A%22JGwWNGJdvx8%22%2C%22nofollow%22%3Atrue%2C%22watchEndpointSupportedOnesieConfig%22%3A%7B%22html5PlaybackOnesieConfig%22%3A%7B%22commonConfig%22%3A%7B%22url%22%3A%22https%3A%2F%2Fr7---sn-42u-i5oes.googlevideo.com%2Finitplayback%3Fsource%3Dyoutube%26orc%3D1%26oeis%3D1%26c%3DWEB%26oad%3D3200%26ovd%3D3200%26oaad%3D11000%26oavd%3D11000%26ocs%3D700%26oewis%3D1%26oputc%3D1%26ofpcc%3D1%26msp%3D1%26odeak%3D1%26odepv%3D1%26osfc%3D1%26ip%3D2405%253A4802%253A236%253Adc90%253A9900%253A9f7%253Af750%253A902e%26id%3D246c1634625dbf1f%26initcwndbps%3D2492500%26mt%3D1635570771%26oweuc%3D%26pxtags%3DCg4KAnR4EggyNDExNDMzNg%26rxtags%3DCg4KAnR4EggyNDExNDMzNg%252CCg4KAnR4EggyNDExNDMzNw%252CCg4KAnR4EggyNDExNDMzOA%22%7D%7D%7D%7D%7D; SIDCC=AJi4QfGYjecF_bQ3ujnNnOZ70GKVIoQOo1iZku8-FVtn4DCP37H83Q7OMV3CccMy7sCn5_r1-bo; __Secure-3PSIDCC=AJi4QfFeB5_KTFJ3iDQK7N-oJM97BLbGcstVlboly7g3IjgjQnxrw1prRG0rAXjWKNRoJ4t-KGY',
  wh: 'https://discord.com/api/webhooks/892943608360075285/wWVheioweyxWMNdJb0Ok17NxBWfuN_0_NPvD1EqUXvD-LSa7W3jXkuDI_iC3mQ0f5l0n'
};
module.exports.CONFIG = CONFIG;

const removeSpoiler = (str) => {
  return Util.escapeSpoiler(str);
}
module.exports.removeSpoiler = removeSpoiler;

const addReact = async (message) => {
  // message.react(CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)])
  //   .catch(console.error);
}
module.exports.addReact = addReact;

const getAllRole = async (message) => {
  const user = message.author;
  const member = message.guild.members.cache.get(user.id);
  const rolesName = member.roles.cache.map(item => {
    return item.name;
  }).map(i => i.toLowerCase());
  const rolesId = member.roles.cache.map(item => {
    return item.id;
  });
  return { rolesName, rolesId };
}
module.exports.getAllRole = getAllRole;

const isPermsDJ = async (client, message) => {
  const { rolesName, rolesId } = await getAllRole(message);
  const serverId = message.guild.id;

  const isDJ = client.customRoles[`${serverId}-${client.user.id}`].find((djPerms) => rolesName.includes(djPerms.toLowerCase()) || rolesId.includes(djPerms));
  if (isDJ && isDJ.length > 0) return true;
  if (rolesName.includes('dj')) return true;
  return false;
}
module.exports.isPermsDJ = isPermsDJ;

const getEmbedMsg = (message, color, title, description) => {
    const embed = new MessageEmbed({
      title: `**${removeSpoiler(title || '')}**` || ' ',
      description: removeSpoiler(description || '') || ' '
    })
    .setColor(color)
    .setTimestamp()
    .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    message.channel.send({embeds: [embed]}).catch(console.error);
};
module.exports.getEmbedMsg = getEmbedMsg;

const getLyric = async (songName, artist) => {
  const options = {
    apiKey: CONFIG.lyricsKEY,
    title: songName,
    artist: '  ',
    optimizeQuery: true
  };
  const lyrics1 = await lyricsFinder(' ', songName);
  if (lyrics1) {
    return `**${songName}**\n\n${lyrics1}`;
  }

  const ly1 = await getLyrics(options);
  return ly1;
}
module.exports.getLyric = getLyric;

module.exports.getStatus = (queue, filters) => {
  return `Status: \`${queue.playing ? "Playing" : "Pause"}\`\nFilters: \`${queue.filters.filter(v => v !== 'customspeed').join(", ") || "Off"}\`\nVolume: \`${queue.volume}\` | Speed: \`${filters.customspeed.split('=')[1]}x\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "Queue" : "Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
}

const swapPosition = (arr, x,y) =>{
  const t = arr[x];
  arr[x] = arr[y];
  arr[y] = t;
}
module.exports.swapPosition = swapPosition;

const notifsError = async (err) => {
  if (!err) return;
  const body = {
    "content": `**<@336414283724226564>**`,
    "embeds": [
      {
        "title": "Music Sanity Bot",
        "description": `${err || ' '}`,
        "color": 16711680
      }
    ]
  }
 
  try {
    const response = await fetch(CONFIG.wh, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
  } catch (err) {}
}
module.exports.notifsError = notifsError;

const formatMsg = (msg) => {
  return `> **${msg}**`;
}
module.exports.formatMsg = formatMsg;

const checkPermission = (message) => {
  try {
    const permissions = message.channel.permissionsFor(message.guild.me);
    const permissionArr = permissions.toArray();

    if(!permissionArr.includes('SEND_MESSAGES')) {
      message.author.send(`${formatMsg(`Bots don't have permission \`SEND_MESSAGES\` in that channel`)}`)
        .catch(console.error);
      return true;
    }

    if(!permissionArr.includes('EMBED_LINKS')) {
      message.channel.send(`${formatMsg(`Bots don't have permission \`EMBED_LINKS\` in this channel`)}`)
        .catch(console.error);
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}
module.exports.checkPermission = checkPermission;

const progressBar = ({ time, totalTime, timeFormat, totalTimeFormat, size = 12}) => {
  const percentage = time / totalTime; 
  const progress = Math.round((size * percentage)); 
  const emptyProgress = size - progress;

  const progressText = '▇'.repeat(progress);
  const emptyProgressText = '—'.repeat(emptyProgress); 

  const bar = `${timeFormat} ${progressText}${emptyProgressText} ${totalTimeFormat}`;
  return bar;
};
module.exports.progressBar = progressBar;

const formatInt = (int) => (int < 10 ? `0${int}` : int);
function formatDuration(sec) {
  if (!sec || !Number(sec)) return "00:00";
  const seconds = Math.round(sec % 60);
  const minutes = Math.floor((sec % 3600) / 60);
  const hours = Math.floor(sec / 3600);
  if (hours > 0) return `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`;
  if (minutes > 0) return `${formatInt(minutes)}:${formatInt(seconds)}`;
  return `00:${formatInt(seconds)}`;
}
module.exports.formatDuration = formatDuration;

const toSecond = (input) => {
  if (!input) return 0;
  if (typeof input !== "string") return Number(input) || 0;
  if (input.match(/:/g)) {
    const time = input.split(":").reverse();
    let s = 0;
    for (let i = 0; i < 3; i++) if (time[i]) s += Number(time[i].replace(/[^\d.]+/g, "")) * Math.pow(60, i);
    if (time.length > 3) s += Number(time[3].replace(/[^\d.]+/g, "")) * 24 * 60 * 60;
    return s;
  } else {
    return Number(input.replace(/[^\d.]+/g, "")) || 0;
  }
}
module.exports.toSecond = toSecond;

