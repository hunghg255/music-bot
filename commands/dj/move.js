const { swapPosition, CONFIG, isPermsDJ, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Swap position 2 songs",
  aliases: ["move", "mv"],
  run: async ({ client, message, args }) => {
      if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
      addReact(message);

      if (args.length !== 2) {
        return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}mv <Number1> <Number2>\` to swap 2 songs`));
      }

      const queue = client.distube.getQueue(message);
      if (!queue) {
        return message.channel.send(formatMsg(`There are currently no songs`));
      }
    
      const isDj = await isPermsDJ(client, message);
      if (!isDj) {
        return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
      }
      
      const num1 = +args[0];
      const num2 = +args[1];

      if (num1 > queue.songs.length - 1 || num2 > queue.songs.length - 1 || num1 === 0 || num2 === 0) {
        return message.channel.send(formatMsg(`Wrong position!!!`));
      }

      if (queue.songs.length) {
        swapPosition(queue.songs, num1, num2);
        message.channel.send(formatMsg(`Move \`${args.join(' ')}\` done`));
      }
      
  }
}