const Discord = require('discord.js');
const { isPermsDJ, resetSkip, CONFIG, addReact, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: "Force skip current song",
  aliases: ["forceskip", "fs"],
  run: async ({ client, message, args }) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!"));
    addReact(message);

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}clear\` to force skip current song`));
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }
    
    const isDj = await isPermsDJ(client, message);
  
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`));
    }

    resetSkip(message.guild.id);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Force skip this song done!`)
      .setDescription(`${message.author} skipped: **${removeSpoiler(queue.songs[0].name)}** - Requested by: ${queue.songs[0].user}`)
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    if (queue.songs.length === 1) {
      await client.distube.stop(message);
    } else {
      await client.distube.skip(message);
    }
    
    message.channel.send({embeds: [embed]});
  }
}