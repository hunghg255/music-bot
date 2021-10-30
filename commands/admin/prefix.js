const fs = require('fs');
const { CONFIG, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: 'Settings prefix',
  aliases: ['prefix'],
  run: async ({ client, message, args }) => {
    if (!args || !args.length) {
      message.channel
        .send(
          formatMsg(
            `Type \`${CONFIG.prefix}prefix <New Prefix>\` to change prefix`
          )
        )
        .catch(console.error);
      return;
    }

    const serverId = message.guild.id;
    const prefix = args[0].trim();

    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    const memberPermissions = member.permissions.toArray();

    if (memberPermissions.includes('ADMINISTRATOR')) {
      // read file json
      let data = fs.readFileSync('./data/prefix.json', {
        encoding: 'utf8',
        flag: 'r',
      });
      data = JSON.parse(data);
      data[serverId] = prefix;

      fs.writeFile('./data/prefix.json', JSON.stringify(data), function (err) {
        if (err) throw err;
        console.log(
          `${message.author.username} - ${serverId}: Change prefix success!`
        );
        client.prefix = {
          ...client.prefix,
          [serverId]: prefix,
        };
        return message.channel
          .send(
            formatMsg(
              `Prefix has been changed successfully. Prefix current is \`${prefix}\``
            )
          )
          .catch(console.error);
      });
      return;
    }
    return message.channel
      .send(
        formatMsg(
          `You do not have permission to change the prefix, Please contact admin`
        )
      )
      .catch(console.error);
  },
};
