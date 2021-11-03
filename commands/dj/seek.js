const { isPermsDJ, CONFIG, addReact, formatMsg, toSecond } = require('../../utils/index.js');

module.exports = {
   name: "Rewind current song",
  aliases: ["rewind", "seek"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    if (!args.length || args.length > 1) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}seek <Seconds number or MM:ss>\` to seek current song`)).catch(console.error);
    }

    let queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }

    const time = toSecond(args[0]);
    const currentSong = queue.songs[0];

    if (time < 0 || time > currentSong.duration) {
      return message.channel.send(formatMsg(`Time should be between \`0\` and \`${currentSong.formattedDuration}\` seconds`)).catch(console.error);
    }
    
    if (time || time == 0) {
      await client.distube.seek(message, time);
      message.channel.send(formatMsg(`Seeked this song for \`${time} seconds\` done`)).catch(console.error);
    } else {
      message.channel.send(formatMsg(`Type \`${CONFIG.prefix}seek <Seconds number or MM:ss>\``)).catch(console.error);
    }
  }
}