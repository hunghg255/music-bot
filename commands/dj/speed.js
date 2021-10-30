const { isPermsDJ, CONFIG, addReact, formatMsg, getEmbedMsg } = require('../../utils/index.js');

module.exports = {
  name: "Set speed",
  aliases: ["speed"],
  run: async ({client, message, args}) => {  
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    if (!args.length || args.length > 1) {
      getEmbedMsg(message, "#ff0000", `Please add a Speed Amount between 0+ and 2!`, `**__Example__**\n\`${CONFIG.prefix}speed 1.5\``);
      return;
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }
    
    const isDj = await isPermsDJ(client, message);
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }
    let speedValue = (args[0] || '').replace(',', '.');
    if (!!parseFloat(speedValue)) {
      if (parseFloat(speedValue) > 0 && parseFloat(speedValue) <= 2) {
        client.filters[message.guild.id].customspeed = `atempo=${parseFloat(speedValue)}`;
        client.distube.filters = client.filters[message.guild.id];
        await client.distube.setFilter(message, ['customspeed']);
        message.channel.send(formatMsg(`Changed speed to \`${speedValue}x\``) ).catch(console.error);
      } else {
        getEmbedMsg(message, "#ff0000", `Please add a Speed Amount between 0+ and 2!`, `**__Example__**\n\`${CONFIG.prefix}speed 1.5\``);
      }
    } else {
      getEmbedMsg(message, "#ff0000", `Please add a Speed Amount between 0+ and 2!`, `**__Example__**\n\`${CONFIG.prefix}speed 1.5\``);
    }
  }
}