const { DataTypes } = require('sequelize');
const { sequelize } = require("../db.js");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isAlphanumeric: true,
      len: [3, 10],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [7, 60],
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 200],
    },
  },
  biography: {
    type: DataTypes.STRING(300),
    allowNull: true,
    validate: {
      len: [0, 300],
    },
  },
});

module.exports = User;
