const { getEmbedMsg } = require('../../utils/index.js');

module.exports = {
  name: 'Check ping',
  aliases: ['ping'],
  run: async ({ client, message, args }) => {
    return getEmbedMsg(
      message,
      `#00ff00`,
      `Bot Ping: \`${Math.floor(
        Date.now() - message.createdTimestamp - 2 * Math.floor(client.ws.ping)
      )} ms\`\nApi Ping: \`${Math.floor(client.ws.ping)} ms\``
    );
  },
};
