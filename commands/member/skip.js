const Discord = require('discord.js');
const fs = require('fs');
const { CONFIG, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: "Vote skip current song",
  aliases: ["skip", 's'],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 

    if (args.length > 0) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}skip\` to vote skip current song`));
    }
    
    let queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }

    const serverId = message.guild.id;
    const author = message.author;
    const path = `./data/skip-${serverId}.json`;

    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({
        count: 0,
        userid: []
      }));
    }
    
    let data = fs.readFileSync(path, {encoding:'utf8', flag:'r'});
    data = JSON.parse(data);
    if (data) {
      if (data.userid.includes(author.id)) {
        return message.channel.send(formatMsg(`You voted skip before that.`));
      }
    }

    const person = message.member.voice.channel.members.map(member => {
       return !member.user.bot
    }).filter(v => v);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Skip this song done!`)
      .setDescription(`${message.author} skipped: **${removeSpoiler(queue.songs[0].name)}** - Requested by: ${queue.songs[0].user}`)
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter('H', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    if (person.length === 1) {
      message.channel.send({embeds: [embed]});
      if (queue.songs.length === 1) {
        await client.distube.stop(message);
      } else {
        await client.distube.skip(message);
      }
      return;
    }
 
    data.count = data.count + 1;
    data.userid.push(author.id);

    if (data.count >= person.length) {
      if (queue.songs.length === 1) {
        await client.distube.stop(message);
      } else {
        await client.distube.skip(message);
      }
      data.count = 0;
      data.userid = [];
      
      message.channel.send({embeds: [embed]});
    }

    if (data.count) {
      message.react('✅');
      message.channel.send(formatMsg(`Voted skip \`(${data.count}/${person.length})\``));
    }

    fs.writeFileSync(path, JSON.stringify(data));
  }
}