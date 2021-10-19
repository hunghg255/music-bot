const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Shuffle queue",
  aliases: ["shuffle"],
  run: async ({client, message, args}) => {  
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}shuffle\` to shuffle current queues`));
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }
    
    client.distube.shuffle(message);
    message.channel.send(formatMsg(`Shuffle queue done!`));
  }
}