const { getEmbedMsg, getStatus, addReact, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: "Current song playing",
  aliases: ["np", "nowplay"],
  run: async ({client, message, args}) => {
    addReact(message);

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`));
    }

    if (queue.songs.length) {
      getEmbedMsg(message, "#00ff00", "Now Playing", `\n**${removeSpoiler(queue.songs[0].name)}**\n\`${queue.formattedCurrentTime} / ${queue.songs[0].formattedDuration}\`\nRequested by: ${queue.songs[0].user}\n\n${getStatus(queue)}`)
    }
  }
}