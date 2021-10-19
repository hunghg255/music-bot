const { getEmbedMsg, isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Loop song or loop queue (0: disbale, 1: Repeat a song, 2: Reapeat queue)",
  aliases: ["loop", "repeat"],
  run: async ({ client, message, args }) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!"));
    addReact(message);

    if (args.length > 1) {
      getEmbedMsg(message, "#ff0000", `Type \`${CONFIG.prefix}loop <Repeat Options>\``, `**Please use a number between 0 and 2**\n\n**0**: \`Disable Repeat\`\n**1**: \`Repeat current song\`\n**2**: \`Repeat queue\``);
      return;
    }

    const queue = client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    const isDj = await isPermsDJ(client, message);
  
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }
    
    if(0 <= Number(args[0]) && Number(args[0]) <= 2){
      client.distube.setRepeatMode(message,parseInt(args[0]));
      getEmbedMsg(message, "#00ff00", " ", `**Repeat mode set: ${args[0].replace("0", `\`Disbale Repeat\``).replace("1", `\`Repeat current song\``).replace("2", `\`Repeat Queue\``)}**`);
    }
    else{
      getEmbedMsg(message, "#ff0000", `Type \`${CONFIG.prefix}loop <Repeat Options>\``, `**Please use a number between 0 and 2**\n\n**0**: \`Disable Repeat\`\n**1**: \`Repeat current song\`\n**2**: \`Repeat queue\``);
    }
  }
}