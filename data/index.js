const mongoose = require('mongoose');

async function connectDb() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      keepAlive: true
    });
    console.log('-----------------------------------');
    console.log('Connect db successfully !');
    console.log('-----------------------------------');
  } catch (error) {
    console.log('-----------------------------------');
    console.log('Connect db faily !');
    console.log('-----------------------------------');
  }
}

module.exports.connectDb = connectDb;