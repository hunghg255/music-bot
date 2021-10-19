const { formatMsg, CONFIG } = require('../../utils/index.js');

module.exports = {
  name: 'Dm with any person',
  aliases: ['dm'],
  run: async ({ client, message, args }) => {
    if (message.author.id !== CONFIG.ownersId) return;
    const personId = args[0];
    const msg = args.slice(1).join(' ');

    if (!Number(personId))
      return message.reply(formatMsg('User id are not valid'));
    if (!msg.trim())
      return message.reply(formatMsg('Message is not be empty!'));

    const person = await client.users.fetch(personId).catch(() => {
      message.reply(formatMsg('Could not find this user!'));
    });

    person
      .send(msg)
      .then(() => message.reply(formatMsg('Done!')))
      .catch(() => {
        message.reply(formatMsg('Could not send message into this user!'));
      });
  },
};
