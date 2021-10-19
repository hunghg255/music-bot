const express = require('express');

const server = express();

server.all('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 5003;

const keepAlive = () => {
  server.listen(PORT, () => {
    console.log(`Server  is ready ${PORT}`);
  });
};

module.exports.keepAlive = keepAlive;
