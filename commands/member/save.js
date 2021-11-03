const Discord = require('discord.js');
const {
  isPermsDJ,
  CONFIG,
  addReact,
  formatMsg,
  removeSpoiler,
} = require('../../utils/index.js');

module.exports = {
  name: 'Save current song',
  aliases: ['save', 'grab', 'rob', 'uwu', 'aww', 'owo', 'yoink'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel
        .send(formatMsg(`There are currently no songs`))
        .catch(console.error);
    }

    if (queue.songs.length) {
      const currentSong = queue.songs[0];
      const embed = new Discord.MessageEmbed()
        .setTitle('Save song')
        .setDescription(
          `[${removeSpoiler(currentSong.name)}](${
            currentSong.url
          })\n\`Duration: ${currentSong.formattedDuration} - Requested by: ${
            currentSong.user.username
          }#${currentSong.user.discriminator}\``
        )
        .setColor('#00ff00')
        .setTimestamp();

      message.author.send({ embeds: [embed] }).catch((error) => {
        message.channel.send(
          formatMsg(
            `You have disabled \`Allow direct messages from server members\``
          )
        );
      });
      message.react('📬').catch(console.error);
    }
  },
};
