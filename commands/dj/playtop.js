const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Play a song to the top of the queue",
  aliases: ["playtop", "pt"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (!args.length) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}p <Name song, URL youtube, URL spotify>\` to add song`));
    }

    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }

    message.channel.send(formatMsg(`Searching this song...`));
    try {
      client.isPlayTop = true;
      await client.distube.play(message, args.join(" "), { unshift: true });
    } catch (err) {
      console.log('play top err: ', err);
    }
  }
}