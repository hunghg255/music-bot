const Discord = require('discord.js');
const { CONFIG, formatMsg } = require('../../utils/index.js');

 const helps = {
  'ADMIN': [
    {command: 'prefix <New prefix>',description: 'Settings prefix'},
    {command: 'cr',description: 'Check roles to have DJ perms'},
    {command: 'cr <Role name or Role ID>',description: 'To add custom roles to have DJ perms'},
    {command: 'cr remove <Role name or Role ID>',description: 'To Remove custom roles to have DJ perms'},
  ],
  'DJ': [
    {command: 'atp, autoplay',description: 'Automatically play music when the queue runs out'},
    {command: 'cl, clear',description: 'Clear Queue'},
    {command: 'filter',description: 'Add filter song'},
    {command: 'fs, fskip, forceskip',description: 'Force skip current song'},
    {command: 'jump',description: 'Jump into song'},
    {command: 'lc, leavecleanup',description: 'Removes absent user’s songs from the Queue.'},
    {command: 'loop, repeat, kimochi',description: 'Loop song or loop queue (0: disbale, 1: Repeat a song, 2: Reapeat queue)'},
    {command: 'm, mv, move',description: 'Swap position 2 songs'},
    {command: 'pause, stop',description: 'Pause current song'},
    {command: 'resume, replay, continue',description: 'Continue play current song'},
    {command: 'rm, remove',description: 'Remove a any song'},
    {command: 'rewind, seek',description: 'Rewind current song'},
    {command: 'shuffle',description: 'Shuffle queue'},
    {command: 'vol, volumn',description: 'Set volumn'},
    {command: 'pt, ptop, playtop',description: 'Add a song to the top of the queue'},
    {command: 'speed',description: 'Set speed for songs (from 0+ to 2)'},
  ],
  'MEMBER': [
    {command: 'help, h, cmd, aliases, commands',description: 'Show All commands'},
    {command: 'ping',description: 'Check ping'},
    {command: 'join',description: 'Add bot into voice channel'},
    {command: 'p, play',description: 'Play a song or list songs'},
    {command: 'q, queue',description: 'All songs in queue'},
    {command: 'dc, leave, disconect, yamero',description: 'Disconect bot'},
    {command: 'np, nowplay',description: 'Current song playing'},
    {command: 'save, grab, yoink, rob, uwu, aww, owo',description: 'Save current song'},
    {command: 'search, find, google, bring',description: 'Search a song'},
    {command: 'l, ly, lyrics',description: 'Get lyrics'},
    {command: 's, skip, next, voteskip',description: 'Vote skip current song'},
  ]
};

const getHelpText = () => {
  return Object.keys(helps).map((help) => {
    const it = helps[help];
    return `**${help}**\n` + it.map(cmd => `\`${cmd.command}\`: ${cmd.description}`).join('\n');
  }).join('\n\n');
}

module.exports = {
  name: "help commands",
  aliases: ["help", "h", "cmd", "command", "aliases"],
  run: async ({ client, message, args }) => {
    const helpText = getHelpText();

    const embed = new Discord.MessageEmbed()
      .setTitle(`Commands with prefix: \`${CONFIG.prefix}\``)
      .setDescription(helpText)
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter('Made by Hùng. A person from Vietnam', 'https://cdn.discordapp.com/attachments/893077644311142450/896571458808082502/istockphoto-1036106190-612x612.jpeg');

    message.author.send({embeds: [embed]}).catch(error => {
      message.channel.send(formatMsg(`You have disabled \`Allow direct messages from server members\``));
    });
    message.react('📬').catch(console.error);
  }
}