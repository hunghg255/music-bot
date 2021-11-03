const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverDataSchema = new Schema({
  serverId: { type: String, maxlength: 255, required: true },
  prefix: { type: String, maxlength: 255, required: true },
  customRoles: { type: Array }
});

module.exports = mongoose.model('serverDataSchema', serverDataSchema);