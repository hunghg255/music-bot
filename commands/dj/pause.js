const {
  addReact,
  isPermsDJ,
  formatMsg,
  CONFIG,
} = require('../../utils/index.js');

module.exports = {
  name: 'Pause current song',
  aliases: ['pause', 'stop'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    addReact(message);

    if (args.length > 0) {
      return message.channel
        .send(formatMsg(`Type \`${CONFIG.prefix}pause\` to pause current song`))
        .catch(console.error);
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel
        .send(formatMsg(`There are currently no songs`))
        .catch(console.error);
    }

    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel
        .send(formatMsg(`You need a \`DJ\` role to perform this command`))
        .catch(console.error);
    }

    if (queue.playing) {
      client.distube.pause(queue);
      message.channel.send(formatMsg(`Paused!`)).catch(console.error);
    } else {
      message.channel.send(formatMsg(`The queue paused!`)).catch(console.error);
    }
  },
};
