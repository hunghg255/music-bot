const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Set volumn",
  aliases: ["vol", "volumn"],
  run: async ({client, message, args}) => {  
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (!args.length || args.length > 1) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}vol <Volumn number>\` to change volumn!`));
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }

    if (!!Number(args[0]) || Number(args[0]) === 0) {
      if (Number(args[0]) >= 0) {
        client.distube.setVolume(message, Number(args[0]));
        message.channel.send(formatMsg(`Changed volume to \`${args[0]}%\``));
      } else {
        message.channel.send(formatMsg(`Must be bigger or equal to 0`));
      }
    } else {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}vol <Volumn number>\` to change volumn!`));
    }
  }
}