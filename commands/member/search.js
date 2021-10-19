const { getEmbedMsg, addReact, formatMsg, removeSpoiler } = require('../../utils/index.js');

module.exports = {
  name: "Search song",
  aliases: ["search", "find", "google", "bring"],
  run: async ({client, message, args}) => {
    if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
    addReact(message);
    
    if (!args.length) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}search <Song name>\` to search a song`));
    }

    let result = await client.distube.search(args.join(" "), {limit: 10});
    result = result.sort((song1, song2) => song2.views - song1.views);
   
    getEmbedMsg(message, "#00ff00", "", `**Choose an option from below or wait 30 seconds to cancel\n**\n${result.map((song, idx) => `**${++idx}**. **${removeSpoiler(song.name)}**\n\`${song.formattedDuration} | Views: ${song.views.toLocaleString('en-US')}\`\n`).join("\n")}`);
    client.searchList = result;
    client.authorSearch = message.author;

    const t = setTimeout(function(){ 
      if (client.searchList) {
        message.channel.send(formatMsg(`Searching canceled.`));
        client.searchList = null;
        client.authorSearch = null;
      }
      clearTimeout(t);
    }, 30000);
  }
}