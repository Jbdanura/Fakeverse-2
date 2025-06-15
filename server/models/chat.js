const { DataTypes } = require('sequelize');
const { sequelize } = require("../db.js");

const Chat = sequelize.define("chat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId1: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId2: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Chat;
