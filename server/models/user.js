const {DataTypes, Model } = require('sequelize');
const {sequelize} = require("../db.js")

const User = sequelize.define("user",{
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate:{
        isAlphanumeric: true,
        len: [3, 10]
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate:{
        len: [7, 60],
        isEmail:true,
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{
        len: [5, 200]
    }
  }
})

module.exports = User