const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Jump into song",
  aliases: ["jump"],
  run: async ({ client, message, args }) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (args.length > 1) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}jump <Position song>\` to jump into a song`));
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
      
    const isDj = await isPermsDJ(client, message);
  
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }
    
    if(0 < Number(args[0]) && Number(args[0]) < queue.songs.length){
      client.distube.jump(message, parseInt(args[0]))
            .catch(err => message.channel.send(formatMsg("Invalid song number.")));
      message.channel.send(formatMsg(`Jumped ${parseInt(args[0])} songs!`));
    } else {
      message.channel.send(formatMsg("Invalid song number."));
    }
  }
}