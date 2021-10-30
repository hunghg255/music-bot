const {
  CONFIG,
  isPermsDJ,
  addReact,
  formatMsg,
} = require('../../utils/index.js');

module.exports = {
  name: 'Automatically play music when the queue runs out',
  aliases: ['autoplay', 'atp'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);

    addReact(message);

    if (args.length > 0) {
      return message.channel
        .send(
          formatMsg(
            `Type \`${CONFIG.prefix}autoplay\` to toggle autoplay queue`
          )
        )
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

    const mode = client.distube.toggleAutoplay(queue);
    message.channel
      .send(formatMsg(`Set autoplay mode to \`${mode ? 'On' : 'Off'}\``))
      .catch(console.error);
  },
};
