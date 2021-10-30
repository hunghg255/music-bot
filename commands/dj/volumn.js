const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Set volumn",
  aliases: ["vol", "volumn"],
  run: async ({client, message, args}) => {  
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    if (!args.length || args.length > 1) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}vol <Volumn number>\` to change volumn!`)).catch(console.error);
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }

    if (!!Number(args[0]) || Number(args[0]) === 0) {
      if (Number(args[0]) >= 0) {
        await client.distube.setVolume(message, Number(args[0]));
        message.channel.send(formatMsg(`Changed volume to \`${args[0]}%\``)).catch(console.error);
      } else {
        message.channel.send(formatMsg(`Must be bigger or equal to 0`)).catch(console.error);
      }
    } else {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}vol <Volumn number>\` to change volumn!`)).catch(console.error);
    }
  }
}