const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const User = sequelize.define("User", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
//   imageUrl:{
//     type:Sequelize.INTEGER,
//     allowNull:false,
// },
  phonenumber: {
    type: Sequelize.BIGINT(10),
    unique: true,
    allowNull: false,
  },
});
module.exports = User;
