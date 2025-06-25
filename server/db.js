require("dotenv").config({path:"./secret/.env"})

const {Sequelize} = require("sequelize")
const cloudinary = require('cloudinary').v2;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {  
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const connect = async() => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({ alter: true });
        console.log("Synced db.");
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

const configCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDNAME,
      api_key: process.env.CLOUDKEY,
      api_secret: process.env.CLOUDSECRET,
    });
  } catch (error) {
    console.log(error)
  }
}

configCloudinary()

module.exports = {sequelize,connect,cloudinary}
