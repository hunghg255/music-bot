const { CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: 'Disconect bot',
  aliases: ['leave', 'disconect', 'dc', 'yamero'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    addReact(message);

    if (args.length > 0) {
      return message.channel
        .send(formatMsg(`Type \`${CONFIG.prefix}dc\` to disconect with bot`))
        .catch(console.error);
    }

    try {
      client.distube.voices.leave(message);
      message.channel
        .send(formatMsg(`**Ok If you have to go say goodbye. Love ya 3000**`))
        .catch(console.error);
    } catch (err) {}
  },
};
