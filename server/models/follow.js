const {DataTypes} = require("sequelize")
const {sequelize} = require("../db")

const Follow = sequelize.define("Follow",{
    followerId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    followingId:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize
})

module.exports = Follow