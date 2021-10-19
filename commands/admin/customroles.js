const fs = require('fs');
const { getAllRole, isPermsDJ, CONFIG, formatMsg } = require('../../utils/index.js');

module.exports = {
  name: "Add custom roles to have DJ perms",
  aliases: ["customroles", "cr"],
  run: async ({ client, message, args }) => {  
    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    const memberPermissions = member.permissions.toArray();
 
    if (!memberPermissions.includes('ADMINISTRATOR')) {
      return message.channel.send(formatMsg(`You do not have permission to change the custom roles with DJ perms!`));
    }
    
    const serverId = message.guild.id;
    const author = message.author;
    const path = `./data/customroles.json`;

    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({}));
    }
    let data = fs.readFileSync(path, {encoding:'utf8', flag:'r'});
    data = JSON.parse(data);
    
    if (!args.length) {
      if (data[serverId] && data[serverId].length > 0) {
        return message.channel.send(formatMsg(`The roles with DJ perms: \`${data[serverId].join(', ')}\``));
      } else {
        return message.channel.send(formatMsg(`No roles with DJ perms. Type \`${CONFIG.prefix}cr <Role name or Role ID>\``));
      }
    }

    const isNumber = args.join(', ').includes('@&');
    const isRemoveCr = args.join(', ').includes('remove');

    if (isNumber) {
      return message.channel.send(formatMsg(`Just enter the Name role or ID role without mention roles`));
    }

    if (isRemoveCr && args.length > 1) {
      if (data[serverId]) {
        data[serverId] = data[serverId].filter((r) => !args.includes(r));
        client[`cr${serverId}`] = data[serverId];
        fs.writeFileSync(path, JSON.stringify(data));
        return message.channel.send(formatMsg(`Remove Custome Role Done!`));
      } else {
        return message.channel.send(formatMsg(`No roles with DJ perms. Type \`${CONFIG.prefix}cr <Role name or Role ID>\``));
      }
    } else if (isRemoveCr) {
      return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}cr remove <Role name or Role ID>\` to remove name role`));
    }

    if (!data[serverId]) {
      data[serverId] = [...args];
    } else {
      data[serverId] = [...data[serverId], ...args];
    }

    data[serverId] = [...new Set(data[serverId])];
    client[`cr${serverId}`] = data[serverId];
    fs.writeFileSync(path, JSON.stringify(data));
    message.channel.send(formatMsg(`Added the roles with DJ perms: \`${args.join(', ')}\``));
  }
}