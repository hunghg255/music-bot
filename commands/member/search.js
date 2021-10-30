const {
  getEmbedMsg,
  addReact,
  formatMsg,
  removeSpoiler,
  CONFIG,
} = require('../../utils/index.js');

module.exports = {
  name: 'Search song',
  aliases: ['search', 'find', 'google', 'bring'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    if (message.member.voice.channel && message.member.voice.selfDeaf) {
      return message.channel
        .send(formatMsg(`You're deafen, so you can't use this command! 😝`))
        .catch(console.error);
    }
    addReact(message);

    if (!args.length) {
      return message.channel
        .send(
          formatMsg(
            `Type \`${CONFIG.prefix}search <Song name>\` to search a song`
          )
        )
        .catch(console.error);
    }

    message.channel
      .send(formatMsg(`Searching: \`${args.join(' ')}\``))
      .catch(console.error);
    let result = await client.distube.search(args.join(' '), { limit: 10 });
    result = result.sort((song1, song2) => song2.views - song1.views);

    getEmbedMsg(
      message,
      '#ffec13',
      '',
      `**__Choose an option from below or wait 30 seconds to cancel or Type 0 to cannel search.__\n**\n${result
        .map(
          (song, idx) =>
            `**${++idx}**. **${removeSpoiler(song.name)}**\n\`${
              song.formattedDuration
            } | Views: ${song.views.toLocaleString('en-US')}\`\n`
        )
        .join('\n')}`
    );
    client[`search-${message.author.id}`] = result;
    client[`author-${message.author.id}`] = message.author.id;

    const t = setTimeout(function () {
      if (client[`time-${message.author.id}`]) {
        message.channel
          .send(formatMsg(`Searching canceled.`))
          .catch(console.error);
        client[`search-${message.author.id}`] = null;
        client[`author-${message.author.id}`] = null;
        client[`time-${message.author.id}`] = 0;
        clearTimeout(client[`time-${message.author.id}`]);
      }
    }, 30000);
    if (!client[`time-${message.author.id}`])
      client[`time-${message.author.id}`] = t;
  },
};
