const Discord = require('discord.js');
const { CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: 'Add bot into voice channel',
  aliases: ['join', 'summon'],
  run: async ({ client, message, args }) => {
    if (!message.member.voice.channel)
      return message.channel
        .send(formatMsg('Please connect to a voice channel!'))
        .catch(console.error);
    addReact(message);

    if (args.length > 0) {
      return message.channel
        .send(formatMsg(`Type \`${CONFIG.prefix}join\` to add bot into VC`))
        .catch(console.error);
    }

    try {
      client.distube.voices.join(message.member.voice.channel);
      message.channel
        .send(formatMsg('It is me pleasure to serve you <3'))
        .catch(console.error);
    } catch (err) {
      const embed = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle(' ')
        .setDescription(
          `**I do not have permission to join this voice channel**`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] }).catch(console.error);
    }
  },
};
