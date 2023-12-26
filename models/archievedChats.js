const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ArchivedChat = sequelize.define('ArchivedChat',{
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isImage:{
      type : Sequelize.BOOLEAN , 
    defaultValue : false
  },
    date_time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    UserId:{
      type: Sequelize.BIGINT,
    },
    GroupName:{
      type: Sequelize.BIGINT,
    }
  },
  {
    timestamps: false
  }
);

module.exports = ArchivedChat;