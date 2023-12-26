const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const ChatHistory = sequelize.define("ChatHistory", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
 GroupName: {
        type: Sequelize.STRING,
        allowNull: false,
       
      },
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: {
    type: Sequelize.TEXT(),
    allowNull: false,
  },
  isImage:{
    type : Sequelize.BOOLEAN , 
  defaultValue : false
},
date_time: {
  type: Sequelize.DATE, 
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), 
},
},
{
  timestamps: false
}
);
module.exports = ChatHistory;
