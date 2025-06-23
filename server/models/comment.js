const {DataTypes} = require("sequelize")
const {sequelize} = require("../db")

const Comment = sequelize.define("comment",{
    description:{
        type:DataTypes.STRING,
        allowNull:false
    },
},{
    sequelize
})

module.exports = Comment