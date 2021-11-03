const Discord = require('discord.js');
const { CONFIG, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: 'Vote skip current song',
  aliases: ['skip', 's', 'voteskip', 'next'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);

    if (args.length > 0) {
      return message.channel
        .send(
          formatMsg(`Type \`${CONFIG.prefix}skip\` to vote skip current song`)
        )
        .catch(console.error);
    }

    let queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel
        .send(formatMsg(`There are currently no songs`))
        .catch(console.error);
    }

    const serverId = message.guild.id;
    const author = message.author;

    const currentSong = queue.songs[0];
    const embed = new Discord.MessageEmbed()
      .setTitle(`Skip this song done!`)
      .setDescription(
        `${message.author} skipped: **${removeSpoiler(
          currentSong.name
        )}** | \`Requested by:\` ${currentSong.user}`
      )
      .setColor('#ffec13')
      .setTimestamp();

    // if user is requested current song
    if (author.id === currentSong.user.id) {
      message.channel.send({ embeds: [embed] }).catch(console.error);
      if (queue.songs.length === 1) {
        await client.distube.stop(message);
      } else {
        await client.distube.skip(message);
      }
      client[`skip-${serverId}`] = null;
      return;
    }

    // vc has 1 person
    const person = message.member.voice.channel.members
      .map((member) => {
        return !member.user.bot;
      })
      .filter((v) => v);

    if (person.length === 1) {
      message.channel.send({ embeds: [embed] }).catch(console.error);
      if (queue.songs.length === 1) {
        await client.distube.stop(message);
      } else {
        await client.distube.skip(message);
      }
      client[`skip-${serverId}`] = null;
      return;
    }

    // not => vote skip
    if (!client[`skip-${serverId}`]) {
      client[`skip-${serverId}`] = {
        count: 0,
        usersId: [],
      };
    }

    if (client[`skip-${serverId}`].usersId.includes(author.id)) {
      return message.channel
        .send(formatMsg(`You voted skip before that.`))
        .catch(console.error);
    }

    client[`skip-${serverId}`].count = client[`skip-${serverId}`].count + 1;
    client[`skip-${serverId}`].usersId.push(author.id);

    if (client[`skip-${serverId}`].count >= person.length) {
      if (queue.songs.length === 1) {
        await client.distube.stop(message);
      } else {
        await client.distube.skip(message);
      }
      client[`skip-${serverId}`] = null;
      message.channel.send({ embeds: [embed] }).catch(console.error);
    }

    if (client[`skip-${serverId}`].count) {
      message.react('✅').catch(console.error);
      message.channel
        .send(
          formatMsg(
            `Voted skip \`(${client[`skip-${serverId}`].count}/${
              person.length
            })\``
          )
        )
        .catch(console.error);
    }
  },
};
