const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Group = sequelize.define('Groups', {
    name:{
        type:Sequelize.STRING(40),
        primaryKey: true,
      unique:true,
      notEmpty:true,
    },
    admin:{
        type:Sequelize.STRING,
        allowNull:false,
    }
  },
    {
        timestamps: false
    });

module.exports = Group;