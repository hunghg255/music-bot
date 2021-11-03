const { CONFIG, formatMsg } = require('../../utils/index.js');
const DataServerController = require('../../data/dataServerController.js');

module.exports = {
  name: "Settings prefix",
  aliases: ["prefix"],
  run: async ({client, message, args}) => {
    if (!args || !args.length) {
      message.channel.send(formatMsg(`Type \`${CONFIG.prefix}prefix <New Prefix>\` to change prefix`)).catch(console.error);
      return;
    }
 
    const idUnique = `${message.guild.id}-${client.user.id}`;
    const prefix = args[0].trim();

    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    const memberPermissions = member.permissions.toArray();
 
    if (memberPermissions.includes('ADMINISTRATOR')) {
      try {
        await DataServerController.updatePrefix(idUnique, prefix);
        client.prefix[idUnique] = prefix;
        return message.channel.send(formatMsg(`Prefix has been changed successfully. Prefix current is \`${prefix}\``)).catch(console.error);
      } catch (err) {}
      return;
    }
    return message.channel.send(formatMsg(`You do not have permission to change the prefix, Please contact admin`)).catch(console.error);
  }
}
