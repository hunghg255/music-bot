const { CONFIG, addReact, formatMsg } = require('../../utils/index.js');

module.exports = {
   name: "Add bot into voice channel",
  aliases: ["join"],
  run: async ({ client, message, args }) => {
      if(!message.member.voice.channel) return message.channel.send(formatMsg("Please connect to a voice channel!")); 
      addReact(message);
      
      if (args.length > 0) {
        return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}join\` to add bot into VC`));
      }
      
      try {
        client.distube.voices.join(message.member.voice.channel);
        message.channel.send(formatMsg('It is me pleasure to serve you <3'));
      } catch (err) {}
  }
}