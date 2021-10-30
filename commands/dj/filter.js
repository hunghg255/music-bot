const {
  isPermsDJ,
  getEmbedMsg,
  CONFIG,
  addReact,
  formatMsg,
} = require('../../utils/index.js');
const filters = require('../../data/filters.json');

module.exports = {
  name: 'Filter song',
  aliases: ['filter'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    addReact(message);

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

    if (Object.keys(filters).includes(args[0])) {
      const filter = await client.distube.setFilter(
        message,
        args[0] === 'clear' ? false : args[0]
      );
      if (args[0] === 'clear') {
        await client.distube.setFilter(message, ['customspeed']);
      }
      message.channel
        .send(
          formatMsg(
            `Current queue filter: \`${
              filter.filter((v) => v !== 'customspeed').join(', ') || 'Off'
            }\``
          )
        )
        .catch(console.error);
    } else {
      getEmbedMsg(
        message,
        '#ff0000',
        `Type \`${CONFIG.prefix}filter <Filter name>\` to toggle a filter`,
        `**__Please choose these options__**\n\`${Object.keys(filters)
          .filter((v) => v !== 'customspeed')
          .join(', ')}\``
      );
    }
  },
};
