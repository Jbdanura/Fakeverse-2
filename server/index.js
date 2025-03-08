require("dotenv").config({path:"./secret/.env"})
const express = require("express");
const app = express();
const {connect} = require("./db.js")
const usersRouter = require("./controllers/users.js")
const postsRouter = require("./controllers/posts.js")
const cors = require('cors')
const bodyParser = require("body-parser")
const User = require("./models/user.js")
const Post = require("./models/post.js")
const Comment = require("./models/comment.js")
const Follow = require("./models/follow.js")
const Like = require("./models/like.js")
const rateLimit = require("express-rate-limit")

app.use(cors())
app.enable('trust proxy');

connect()

const modelsSync = () => {
    try {
      User.hasMany(Post,{
        foreignKey:"userId"
      })
      Post.belongsTo(User)
      User.hasMany(Comment,{
        foreignKey:"userId"
      })
      Post.hasMany(Comment,{
        foreignKey:"postId"
      })
      Comment.belongsTo(User)
      Comment.belongsTo(Post)
      User.belongsToMany(User,{through:Follow, as:"following", foreignKey:"followingId"})
      User.belongsToMany(User,{through:Follow, as:"follower", foreignKey:"followerId"})
      Follow.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
      Follow.belongsTo(User, { as: 'following', foreignKey: 'followingId' });
      User.hasMany(Like, {
        foreignKey: "userId"
      });
      
      Post.hasMany(Like, {
        foreignKey: "postId"
      });
      
      Like.belongsTo(User);
      Like.belongsTo(Post);
    } catch (error) {
      console.log(error)
    }
  }
  
modelsSync()

const limiter = rateLimit({
	windowMs: 15 * 60 * 10000,
	limit: 10000,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
})

app.use(limiter)

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.listen(process.env.PORT,()=>{
    console.log("running server!")
})

app.use("/users",usersRouter)
app.use("/posts",postsRouter)

const http = require("http");
const https = require("https");
