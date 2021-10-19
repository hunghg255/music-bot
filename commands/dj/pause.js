const { getEmbedMsg, getStatus, addReact, isPermsDJ, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Pause current song",
  aliases: ["pause"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}pause\` to pause current song`));
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }
    
    if (queue.playing) {
      client.distube.pause(queue);
      message.channel.send(formatMsg(`Paused!`));
    } else {
      message.channel.send(formatMsg(`The queue paused!`));
    }
  }
}