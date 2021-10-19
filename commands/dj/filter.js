const { isPermsDJ, getEmbedMsg, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Filter song",
  aliases: ["filter"],
  run: async ({ client, message, args }) => {
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
    
    if(CONFIG.filters.includes(args[0])) {
      const filter = client.distube.setFilter(message, args[0]);
      message.channel.send(formatMsg(`Current queue filter: \`${filter.join(", ") || "OFF"}\``));
    } else {
        getEmbedMsg(message, "#ff0000", `Type \`${CONFIG.prefix}filter <Filter name>\` to toggle a filter`, `**Please choose these options**\n\n\`${CONFIG.filters.join(', ')}\``);
    }
    
  }
}