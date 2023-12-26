const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const ChatHistory = sequelize.define("ChatHistory", {

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
}
});
module.exports = ChatHistory;
