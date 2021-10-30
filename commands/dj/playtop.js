const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Play a song to the top of the queue",
  aliases: ["playtop", "pt", "ptop"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);

    if (message.member.voice.channel && message.member.voice.selfDeaf) {
      return message.channel.send(formatMsg(`You're deafen, so you can't use this command! 😝`)).catch(console.error);
    }

    addReact(message);

    if (!args.length) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}pt <Name song, URL youtube, URL spotify>\` to add song`)).catch(console.error);
    }

    const isDj = await isPermsDJ(client, message);

    if ((args.join(" ").includes('playlist') || args.join(" ").includes('list=')) && !isDj) {
      return message.channel.send(formatMsg(`You should only add 1 song on top of queue`)).catch(console.error);
    }
    
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }

    try {
      message.channel.send(formatMsg(`Searching: \`${args.join(" ")}\``)).catch(console.error);
      client.isPlayTop = true;
      await client.distube.play(message, args.join(" "), { unshift: true });
    } catch (err) {
      console.log('play top err: ', err);
    }
  }
}