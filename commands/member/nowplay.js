const { getEmbedMsg, getStatus, addReact, formatMsg, removeSpoiler, progressBar } = require('../../utils/index.js');

module.exports = {
  name: "Current song playing",
  aliases: ["np", "nowplay"],
  run: async ({client, message, args}) => {
    if (message.member.voice.channel && message.member.voice.selfDeaf) {
      return message.channel.send(formatMsg(`You're deafen, so you can't use this command! 😝`)).catch(console.error);
    }
    
    addReact(message);

    const queue = client.distube.getQueue(message);
    if (!queue) {
      return message.channel.send(formatMsg(`There are currently no songs`)).catch(console.error);
    }

    if (queue.songs.length) {
      getEmbedMsg(message, "#00ff00", "Now Playing", `**${removeSpoiler(queue.songs[0].name)}**\n\n\`${progressBar({
        time: queue.currentTime,
        totalTime: queue.songs[0].duration,
        timeFormat: queue.formattedCurrentTime,
        totalTimeFormat: queue.songs[0].formattedDuration
      })}\`\n**Requested by:** ${queue.songs[0].user}\n\n${getStatus(queue, client.filters[message.guild.id])}`)
    }
  }
}