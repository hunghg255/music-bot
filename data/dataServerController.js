const ServerDataSchema = require('./serverDataSchema');

class DataServerController {
  // get data by server id
  async getDataServerById(serverId) {
    const data = await ServerDataSchema.findOne({ serverId: serverId });
    if (data) return data;

    // create new data
    const initData = {
      serverId: serverId,
      prefix: '!!',
      customRoles: []
    };
    const newServerData = new ServerDataSchema(initData);
    newServerData
      .save()
      .then(() => {
        console.log('Create new data success');
      });

    return initData;
  }

  // update prefix by serverId
  async updatePrefix(serverId, newPrefix) {
    const dataServer = await ServerDataSchema.findOne({ serverId: serverId });

    // update
    if (dataServer) {
      ServerDataSchema.updateOne({ serverId: serverId }, {
        prefix: newPrefix,
        serverId: serverId,
        customRoles: dataServer.customRoles
      }).then(() => {
        console.log('Update new prefix success!');
      });
      return;
    }

    // create new
    const newServerData = new ServerDataSchema({
      serverId: serverId,
      prefix: newPrefix,
      customRoles: []
    });

    newServerData
      .save()
      .then(() => {
        console.log('Create new prefix success!');
      });
  }

   // update custom roles by serverId
  async updateCustomRoles(serverId, newCustomRoles) {
    const dataServer = await ServerDataSchema.findOne({ serverId: serverId });

    // update
    if (dataServer) {
      const cr = [...newCustomRoles, ...dataServer.customRoles];
      ServerDataSchema.updateOne({ serverId: serverId }, {
        serverId: serverId,
        prefix: dataServer.prefix,
        customRoles: [...new Set(cr)]
      }).then(() => {
        console.log('Update custome roles success!');
      });
      return [...new Set(cr)];
    }

    // create new
    const newServerData = new ServerDataSchema({
      serverId: serverId,
      prefix: '!!',
      customRoles: [...new Set(newCustomRoles)]
    });

    newServerData
      .save()
      .then(() => {
        console.log('Create custome roles success!');
      });
    return [...new Set(newCustomRoles)];
  }

  // remove custome roles
  async removeCustomRoles(serverId, rolesRemove) {
    const dataServer = await ServerDataSchema.findOne({ serverId: serverId });
    const newCr = dataServer.customRoles.filter((r) => !rolesRemove.includes(r));

    ServerDataSchema.updateOne({ serverId: serverId }, {
      serverId: serverId,
      prefix: dataServer.prefix,
      customRoles: [...new Set(newCr)]
    }).then(() => {
      console.log('Remove custom roles done');
    });
    return [...new Set(newCr)];
  }
}

module.exports = new DataServerController();