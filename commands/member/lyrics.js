const Discord = require('discord.js');
const { getLyric, getEmbedMsg, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Get lyrics",
  aliases: ["lyrics", "ly", "l"],
  run: async ({ client, message, args }) => {
    addReact(message);
    
    const queue = client.distube.getQueue(message);
    if (!queue && !args.length) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    message.channel.send(formatMsg(`Searching lyrics this song...`));

    if (args.length > 0) {
      try {
        const result = await getLyric(args.join(' '));
   
        if (!result) {
          return message.channel.send(formatMsg(`Could not find lyrics!!`));
        }

        const chunks = Discord.Util.splitMessage(result);

        if (chunks.length > 1) {
          chunks.forEach((chunk, i) => {
            getEmbedMsg(message, `#00ff00`, `Lyrics part ${i + 1}`, `${chunk}`)
          });
        } else {
          return getEmbedMsg(message, `#00ff00`, `Lyrics`, `${chunks[0]}`);
        }
      } catch (err) {
        return message.channel.send(formatMsg(`Could not find lyrics!!`));
      }
      return;
    }

    if (queue.songs.length) {
      try {
        const result = await getLyric(queue.songs[0].name);
        if (!result) {
          return message.channel.send(formatMsg(`Could not find lyrics!!`));
        }
        const chunks = Discord.Util.splitMessage(result);

        if (chunks.length > 1) {
          chunks.forEach((chunk, i) => {
            getEmbedMsg(message, `#00ff00`, `Lyrics part ${i + 1}`, `${chunk}`)
          });
        } else {
          return getEmbedMsg(message, `#00ff00`, `Lyrics`, `${chunks[0]}`);
        }
      } catch (err) {
        return message.channel.send(formatMsg(`Could not find lyrics!!`));
      }
    }
  }
}