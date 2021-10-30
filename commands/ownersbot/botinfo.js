const Discord = require('discord.js');
const { formatDuration } = require('../../utils/index.js');
const cpuStat = require('cpu-stat');
const os = require('os');

module.exports = {
  name: 'Bot Info',
  aliases: ['botinfo'],
  run: async ({ client, message, args }) => {
    try {
      cpuStat.usagePercent(function (e, percent, seconds) {
        try {
          let connectedchannelsamount = 0;
          let guilds = client.guilds.cache.map((guild) => guild);
          for (let i = 0; i < guilds.length; i++) {
            if (guilds[i].me.voice.channel) connectedchannelsamount += 1;
          }
          if (connectedchannelsamount > client.guilds.cache.size)
            connectedchannelsamount = client.guilds.cache.size;

          const botinfo = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setTitle('__**Stats:**__')
            .setColor('#ffec13')
            .addField(
              '⏳ Memory Usage',
              `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                2
              )}/ ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB\``,
              true
            )
            .addField(
              '⌚️ Uptime ',
              `\`${formatDuration(client.uptime)}\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField(
              '📁 Users',
              `\`Total: ${client.users.cache.size} Users\``,
              true
            )
            .addField(
              '📁 Servers',
              `\`Total: ${client.guilds.cache.size} Servers\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField(
              '📁 Voice-Channels',
              `\`${
                client.channels.cache.filter(
                  (ch) =>
                    ch.type === 'GUILD_VOICE' || ch.type === 'GUILD_STAGE_VOICE'
                ).size
              }\``,
              true
            )
            .addField(
              '🔊 Connections',
              `\`${connectedchannelsamount} Connections\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField('👾 Discord.js', `\`v${Discord.version}\``, true)
            .addField('🤖 Node', `\`${process.version}\``, true)
            .addField('\u200b', `\u200b`, true)
            .addField(
              '🤖 CPU',
              `\`\`\`md\n${os.cpus().map((i) => `${i.model}`)[0]}\`\`\``
            )
            .addField('🤖 CPU usage', `\`${percent.toFixed(2)}%\``, true)
            .addField('🤖 Arch', `\`${os.arch()}\``, true)
            .addField('\u200b', `\u200b`, true)
            .addField('💻 Platform', `\`\`${os.platform()}\`\``, true)
            .setFooter(
              'Hùng',
              'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
            );
          message.reply({
            embeds: [botinfo],
          });
        } catch (e) {
          console.log(e);
          let connectedchannelsamount = 0;
          let guilds = client.guilds.cache.map((guild) => guild);
          for (let i = 0; i < guilds.length; i++) {
            if (guilds[i].me.voice.channel) connectedchannelsamount += 1;
          }
          if (connectedchannelsamount > client.guilds.cache.size)
            connectedchannelsamount = client.guilds.cache.size;
          const botinfo = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setTitle('__**Stats:**__')
            .setColor('#ffec13')
            .addField(
              '⏳ Memory Usage',
              `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                2
              )}/ ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB\``,
              true
            )
            .addField(
              '⌚️ Uptime ',
              `\`${formatDuration(client.uptime)}\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField(
              '📁 Users',
              `\`Total: ${client.users.cache.size} Users\``,
              true
            )
            .addField(
              '📁 Servers',
              `\`Total: ${client.guilds.cache.size} Servers\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField(
              '📁 Voice-Channels',
              `\`${
                client.channels.cache.filter(
                  (ch) =>
                    ch.type === 'GUILD_VOICE' || ch.type === 'GUILD_STAGE_VOICE'
                ).size
              }\``,
              true
            )
            .addField(
              '🔊 Connections',
              `\`${connectedchannelsamount} Connections\``,
              true
            )
            .addField('\u200b', `\u200b`, true)
            .addField('👾 Discord.js', `\`v${Discord.version}\``, true)
            .addField('🤖 Node', `\`${process.version}\``, true)
            .addField('\u200b', `\u200b`, true)
            .addField(
              '🤖 CPU',
              `\`\`\`md\n${os.cpus().map((i) => `${i.model}`)[0]}\`\`\``
            )
            .addField('🤖 CPU usage', `\`${percent.toFixed(2)}%\``, true)
            .addField('🤖 Arch', `\`${os.arch()}\``, true)
            .addField('\u200b', `\u200b`, true)
            .addField('💻 Platform', `\`\`${os.platform()}\`\``, true)
            .setFooter(
              'Hùng',
              'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg'
            );
          message.reply({
            embeds: [botinfo],
          });
        }
      });
    } catch (e) {}
  },
};
