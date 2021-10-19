const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Continue play current song",
  aliases: ["resume", "replay"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }

    const isDj = await isPermsDJ(client, message);

    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}resume\` to continue play current song`));
    }
  
    if (!queue.playing) {
      client.distube.resume(message);
      message.channel.send(formatMsg(`Continue playing!`));
    } else {
      return message.channel.send(formatMsg(`The queue is playing`));
    }
  }
}