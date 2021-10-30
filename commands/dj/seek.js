const {
  isPermsDJ,
  CONFIG,
  addReact,
  formatMsg,
} = require('../../utils/index.js');

module.exports = {
  name: 'Rewind current song',
  aliases: ['rewind', 'seek'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    addReact(message);

    if (args.length > 1) {
      return message.channel
        .send(
          formatMsg(
            `Type \`${CONFIG.prefix}seek <Number seconds>\` to seek current song`
          )
        )
        .catch(console.error);
    }

    let queue = client.distube.getQueue(message);
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

    if (!!Number(args[0]) || Number(args[0]) == 0) {
      if (Number(args[0]) >= 0) {
        client.distube.seek(message, Number(args[0]));
        message.channel
          .send(formatMsg(`Seeked this song for \`${args[0]} seconds\` done`))
          .catch(console.error);
      } else {
        message.channel
          .send(formatMsg(`Must be bigger or equal to 0`))
          .catch(console.error);
      }
    } else {
      message.channel
        .send(formatMsg(`Type \`${CONFIG.prefix}seek <Number seconds>\``))
        .catch(console.error);
    }
  },
};
