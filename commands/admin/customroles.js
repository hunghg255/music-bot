const { CONFIG, formatMsg, getEmbedMsg } = require('../../utils/index.js');
const DataServerController = require('../../data/dataServerController.js');

module.exports = {
  name: "Add custom roles to have DJ perms",
  aliases: ["customroles", "cr"],
  run: async ({ client, message, args }) => {  
    const user = message.author;
    const member = message.guild.members.cache.get(user.id);
    const memberPermissions = member.permissions.toArray();
 
    if (!memberPermissions.includes('ADMINISTRATOR')) {
      return message.channel.send(formatMsg(`You do not have permission to change the custom roles with DJ perms!`)).catch(console.error);
    }
    
    const idUnique = `${message.guild.id}-${client.user.id}`;
    
    const dataServer = await DataServerController.getDataServerById(idUnique);

    if (!args.length) {
      if (dataServer.customRoles.length) {
        getEmbedMsg(message, "#00ff00", `**__The roles with DJ perms__**`, `\`${dataServer.customRoles.join('\n')}\``);
      } else {
        return message.channel.send(formatMsg(`No roles with DJ perms. Type \`${CONFIG.prefix}cr <Role name or Role ID>\``)).catch(console.error);
      }
      return;
    }

    const rolesText = args.filter(v => !v.includes('@&'));
    const rolesMentions = message.mentions.roles.map(role => role.name);
    const crArr = [...rolesText, ...rolesMentions].filter(v => v && v.toLowerCase() !== 'remove');
    const isRemoveCr = args.join(' ').toLowerCase().includes('remove');
  
    if (isRemoveCr) {
      if (!dataServer.customRoles.length || !crArr.length) return message.channel.send(formatMsg(`Type \`${CONFIG.prefix}cr remove <Role name or Role ID>\``)).catch(console.error);
      const customRoles = await DataServerController.removeCustomRoles(idUnique, crArr);
      client.customRoles[idUnique] = customRoles;
      getEmbedMsg(message, "#00ff00", `**__Remove Custome Role__**`, `\`${crArr.join('\n')}\``);
      return;
    }
    
    try {
      const customRoles = await DataServerController.updateCustomRoles(idUnique, crArr);
      client.customRoles[idUnique] = customRoles;
      getEmbedMsg(message, "#00ff00", `**__Added the roles with DJ perms__**`, `\`${crArr.join('\n')}\``);
    } catch (err) {}
  }
}