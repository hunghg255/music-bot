const { getEmbedMsg } =  require('../../utils/index.js');

module.exports = {
  name: "Check ping",
  aliases: ["ping"],
  run: async ({client, message, args}) => {
    return getEmbedMsg(message, `#00ff00`, `PING: ${client.ws.ping}ms`);
  }
}