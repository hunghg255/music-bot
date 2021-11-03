const { isPermsDJ, CONFIG, addReact, getEmbedMsg, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Remove",
  aliases: ["remove", "rm"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    const authorId = message.author.id;
    
    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }

    if (!args.length) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}rm <Position song>\` to remove a song`)).catch(console.error);
    }

    const isDj = await isPermsDJ(client, message);

    // dj = false, remove > 1
    if (!isDj && args.length > 1) {
      return message.channel.send(formatMsg(`You need to a \`DJ\` to remove more than 1 song`)).catch(console.error);
    }

    // wrong position
    if (+args[0] <= 0 || +args[0] >= queue.songs.length || !(+args[0])) {
      return message.channel.send(formatMsg(`Wrong position!!`)).catch(console.error);
    }

    // dj = false, remove == 1
    if (!isDj && args.length == 1) {
      const songRemove = queue.songs[+args[0]];
      if (songRemove.user.id !== authorId) {
        return message.channel.send(formatMsg(`You can't remove other people's songs`)).catch(console.error);
      }
      
      queue.songs = [...queue.songs.slice(0,+args[0]), ...queue.songs.slice(+args[0] + 1)];
      getEmbedMsg(message, "#00ff00", `**\`${message.author.username}#${message.author.discriminator}\` removed \`${args.join(' ')}\`.**`, `\n**${songRemove.name}**\n${client.emojiReply}\`Requested by:\` ${songRemove.user}`);
      return;
    }

    // dj = true
    const listSongRemove = queue.songs.filter((item, idx) => args.includes(`${idx}`));
    queue.songs = queue.songs.filter((item, idx) => !args.includes(`${idx}`));
  
    const textSongRemove = listSongRemove.map((val) => `**${val.name}**\n${client.emojiReply}\`Requested by:\` ${val.user}`).join('\n\n');
    getEmbedMsg(message, "#00ff00", `**\`${message.author.username}#${message.author.discriminator}\` removed \`${args.join(' ')}\`.**`, `\n${textSongRemove}`);
  }
}