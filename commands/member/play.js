const { isPermsDJ, CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Play or Search a song",
  aliases: ["play", "p"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);

    if (!args.length) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}p <Name song, URL youtube, URL spotify>\` to add song`));
    }

    message.channel.send(formatMsg(`Searching this song...`));
    const isDj = await isPermsDJ(client, message);
    const queue = client.distube.getQueue(message);
  
    if (queue) {
      const listSongsUserSelect = queue.songs.filter((song) => {
        return song.user.id === message.author.id;
      })
     
      if (listSongsUserSelect.length >= 3 && !isDj) {
        return message.channel.send(formatMsg(`You can only add up to 3 songs, You need a \`DJ\` role to add more songs`));
      }
    }
    
    try {
      await client.distube.play(message, args.join(" "));
    } catch (err) {}
  }
}