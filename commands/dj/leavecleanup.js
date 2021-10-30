const { CONFIG, isPermsDJ, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Removes absent user’s songs from the Queue.",
  aliases: ["lc", "leavecleanup"],
  run: async ({ client, message, args }) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}lc\` to removes absent user’s songs from the Queue.`)).catch(console.error);
    }

    const queue = client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }
  
    const isDj = await isPermsDJ(client, message);

    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }

    const channel = await client.channels.fetch(message.member.voice.channelId);

    const users = channel.members.filter((val) => {
      if (!val.user.bot) {
        return val;
      }
    }).map(v => v.user.id);

    const newQueue = queue.songs.slice(1).filter((song) => {
      return users.includes(song.member.id);
    });
    
    const length = queue.songs.slice(1).length - newQueue.length;
    queue.songs = [queue.songs[0], ...newQueue];

    message.channel.send(formatMsg(`Cleared \`${length}\` songs`)).catch(console.error);
  }
}