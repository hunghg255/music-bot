const Discord = require('discord.js');
const { isPermsDJ, CONFIG, addReact, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: "Force skip current song",
  aliases: ["forceskip", "fs", "fskip"],
  run: async ({ client, message, args }) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")).catch(console.error);
    addReact(message);

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}fs\` to force skip current song`)).catch(console.error);
    }

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }
    
    const isDj = await isPermsDJ(client, message);
  
    if (!isDj) {
      return message.channel.send(formatMsg(`You need a \`DJ\` role to perform this command`)).catch(console.error);
    }

    const embed = new Discord.MessageEmbed()
      .setTitle(`**__\`${message.author.username}#${message.author.discriminator}\` forced skip this song done!__**`)
      .setDescription(`**${removeSpoiler(queue.songs[0].name)}**\n${client.emojiReply}Requested by: ${queue.songs[0].user}`)
      .setColor('#ffec13')
      .setTimestamp()
      .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    if (queue.songs.length === 1) {
      await client.distube.stop(message);
    } else {
      await client.distube.skip(message);
    }
    
    client[`skip-${message.guild.id}`] = null;
    message.channel.send({embeds: [embed]}).catch(console.error);
  }
}