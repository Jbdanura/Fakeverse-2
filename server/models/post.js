const {DataTypes } = require('sequelize');
const {sequelize} = require("../db.js")

const Post = sequelize.define("Post",{
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username:{
    type: DataTypes.STRING,
    allowNull:false,
  }
})

module.exports = Post