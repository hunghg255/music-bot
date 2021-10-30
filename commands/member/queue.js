const { MessageEmbed } = require('discord.js');
const {
  CONFIG,
  addReact,
  formatMsg,
  removeSpoiler,
} = require('../../utils/index.js');

const getEmbedQueue = (songs) => {
  const embeds = [];
  let k = 10;

  const nowPlay = `**__Playing Now__**\n**${removeSpoiler(
    songs[0].name
  )}** | \`${songs[0].formattedDuration} - Requested by:\` ${songs[0].user}${
    songs.length > 1 ? `\n\n**__Up Next__**\n` : ''
  }`;
  if (songs.length == 1) {
    const embed = new MessageEmbed({
      title: ' ',
      description: nowPlay,
      color: '#ffec13',
    });
    embeds.push(embed);
    return embeds;
  }
  let newSong = songs.slice(1).map((song, idx) => ({ idx: idx + 1, ...song }));
  for (let i = 0; i < newSong.length; i += 10) {
    const current = newSong.slice(i, k);
    let j = i;
    k += 10;
    const info = current.map(
      (val) =>
        `**\`${val.idx}.\` ${removeSpoiler(val.name)}** | \`${
          val.formattedDuration
        } - Requested by:\` ${val.user}`
    );
    const embed = new MessageEmbed({
      title: ' ',
      description: nowPlay + info.join('\n\n'),
      color: '#ffec13',
    });
    embeds.push(embed);
  }
  return embeds;
};

module.exports = {
  name: 'Song list in queue',
  aliases: ['q', 'queue'],
  run: async ({ client, message, args }) => {
    if (message.member.voice.channel && message.member.voice.selfDeaf) {
      return message.channel
        .send(formatMsg(`You're deafen, so you can't use this command! 😝`))
        .catch(console.error);
    }
    if (args.length > 0) {
      return message.channel
        .send(formatMsg(`Type \`${CONFIG.prefix}q\` to show queue`))
        .catch(console.error);
    }
    addReact(message);

    let queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel
        .send(formatMsg(`Queue Empty!!`))
        .catch(console.error);
    }

    let currentPage = 0;

    const embeds = getEmbedQueue(queue.songs);

    const inforQ = `**Current Page: \`${currentPage + 1}/${
      embeds.length
    }\`\nTotal: \`${queue.songs.length} songs\`\nTotal Time: \`${
      queue.formattedDuration
    }\` **`;
    embeds[currentPage].setTitle(inforQ);
    const queueEmbed = await message.channel
      .send({
        embeds: [embeds[currentPage]],
      })
      .catch(console.error);
    if (queue.songs.length <= 11) return;
    await queueEmbed.react('◀️');
    await queueEmbed.react('▶️');
    await queueEmbed.react('❌');

    const filter = (reaction, user) =>
      ['◀️', '▶️', '❌'].includes(reaction.emoji.name) &&
      message.author.id === user.id;

    const collector = queueEmbed.createReactionCollector(filter);

    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === '▶️') {
        if (currentPage < embeds.length - 1) {
          currentPage++;
          const inforQ = `**Current Page: \`${currentPage + 1}/${
            embeds.length
          }\`\nTotal: \`${queue.songs.length} songs\`\nTotal Time: \`${
            queue.formattedDuration
          }\` **`;
          embeds[currentPage].setTitle(inforQ);
          queueEmbed.edit({
            embeds: [embeds[currentPage]],
          });
        }
      } else if (reaction.emoji.name === '◀️') {
        if (currentPage !== 0) {
          --currentPage;
          const inforQ = `**Current Page: \`${currentPage + 1}/${
            embeds.length
          }\`\nTotal: \`${queue.songs.length} songs\`\nTotal Time: \`${
            queue.formattedDuration
          }\` **`;
          embeds[currentPage].setTitle(inforQ);
          queueEmbed.edit({
            embeds: [embeds[currentPage]],
          });
        }
      } else if (reaction.emoji.name === '❌') {
        if (currentPage !== 0) {
          collector.stop();
        }
      }
    });
  },
};
