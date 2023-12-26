const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Groupmember = sequelize.define("GroupMembers", {
  userid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  GroupName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Groupmember;
