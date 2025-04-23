const usersRouter = require("express").Router()
const User = require("../models/user.js")
const bcrypt = require("bcryptjs")
require('dotenv').config({ path: './secret/.env' })
const jwt = require("jsonwebtoken")
const getToken = require("../middleware/token.js")
const Post = require("../models/post.js")
const Comment = require("../models/comment.js")
const Follow = require("../models/follow.js")
const Like = require("../models/like.js")
const {cloudinary} = require("../db.js")
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

usersRouter.post("/register",async(req,res)=>{
    try {
        let {username,email,password} = req.body
        username = username.toLowerCase()
        email = email.toLowerCase()
        if(username.length < 3 || username.length > 10) return res.status(400).send("Username length must be between 3 and 10 characters")
        if (!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) return res.status(400).send("Invalid email")
        if(password.length < 5 || password.length > 20) return res.status(400).send("Password must be between 5 and 20 characters long")
        let user = await User.findOne({where:{username}})
        if(user) return res.status(400).send("Username has already been taken")
        user = await User.findOne({where:{email}})
        if(user) return res.status(400).send("Email has already been taken")
        const passwordHash = await bcrypt.hash(password,10)
        const newUser = await User.create({username,email,password:passwordHash})
        await newUser.save()
        return res.status(200).send(newUser)
    } catch (error) {
        console.log(error)
        return res.status(400).send("Error in user creation")
    }
})

usersRouter.post("/login",async(req,res)=>{
    try {
        let {username,password} = req.body
        username = username.toLowerCase()
        if(username.length < 3 || username.length > 10) return res.status(400).send("Username length must be between 3 and 10 characters")
        if(password.length < 5 || password.length > 20) return res.status(400).send("Password must be between 5 and 20 characters long")
        let user = await User.findOne({where:{username}})
        if(!user) return res.status(400).send("Invalid user/password combination") 
        const samePassword = await bcrypt.compare(password,user.password)
        if(!samePassword) return res.status(400).send("Invalid user/password combination")
        const token = jwt.sign({ id: user.id },process.env.SECRET,{expiresIn: 86400});
        return res.status(200).send({
            id:user.id,
            username:user.username,
            token
        })
    } catch (error) {
        console.log(error)
        return res.status(400).send("Error in user log in")
    }
})

usersRouter.get("/user/:username",async(req,res)=>{
    try {
        const username = req.params.username.toLowerCase()
        const user = await User.findOne({where:{username},attributes:["username","id","biography","updatedAt"],
        include:[{model:Post,include:[{model:Like,include:{model:User,attributes:["username"]}},{model:Comment,include:{model:User,attributes:["username"]}}]}],order: [[Post, "createdAt", "DESC"]],})
        console.log(user)
        return res.status(200).send(user)
    } catch (error) {
        return res.status(400).send(error)
    }
})

usersRouter.get("/recommended", getToken, async (req, res) => {
    try {
        const allUsers = await User.findAll({
            attributes: ["username", "id"]
        });

        const currentUsername = req.user.username;

        const filteredUsers = allUsers
            .filter(user => user.username !== currentUsername)
            .splice(0,6)

        return res.status(200).send(filteredUsers);
    } catch (error) {
        return res.status(400).send(error);
    }
});


usersRouter.get("/followInfo/:username",async(req,res)=>{
    try {
        const username = req.params.username
        console.log(username)
        const user = await User.findOne({where:{username}})
        const following = await Follow.findAll({
            where:{followerId:user.id},
            include:[{
                model: User,
                as:"following",
                attributes:["username"]
            }],
        })
        const followers = await Follow.findAll({
            where:{followingId:user.id},
            include:[{
                model: User,
                as:"follower",
                attributes:["username"]
            }],
            
        })
        return res.status(200).json({following,followers})  
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})

usersRouter.post("/followingState",async(req,res)=>{
    try {
        const following = await User.findOne({where: {username:req.body.following}})
        const follower = await User.findOne({where: {username:req.body.follower}})
        const follow = await Follow.findOne({where:{followingId:following.id, followerId:follower.id}})
        if(follow){
            return res.status(200).send(true)
        } else{
            return res.status(200).send(false)
        } 
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }

})

usersRouter.post("/changePassword", getToken, async(req,res)=>{
    try {
        const user = req.user
        const oldPass = req.body.oldPassword
        const newPass = req.body.newPassword
        if(newPass.length < 5 || newPass.length > 20) return res.status(400).send("New password must be between 5 and 20 characters long")
        const samePassword = await bcrypt.compare(oldPass,user.password)
        bcrypt.compare(oldPass, user.password, function(err, result){
            console.log(result,oldPass,user.password);
        })
        if(samePassword){
            const passwordHash = await bcrypt.hash(newPass,10)
            user.password = passwordHash
            await user.save()
        } else{
            return res.status(400).send("Current password invalid")
        }
        return res.status(200).send("Password changed")
    } catch (error) {
        console.log(error)
        return res.status(400).send("Error changing password")
    }
})

usersRouter.post("/follow", getToken, async (req, res) => {
    try {
      const me = req.user;  
      const { userToFollow: targetUsername } = req.body;
  
      const target = await User.findOne({ where: { username: targetUsername } });
      if (!target) {
        return res.status(404).send({ error: "User to follow not found" });
      }
  
      if (target.id === me.id) {
        return res.status(400).send({ error: "You cannot follow yourself" });
      }
  
      const existing = await Follow.findOne({
        where: { followingId: target.id, followerId: me.id },
      });
  
      if (existing) {
        await existing.destroy();
        return res.status(200).send(false);  
      }
  
      const follow = await Follow.create({
        followingId: target.id,
        followerId: me.id,
      });
      return res.status(200).send(follow);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Server error" });
    }
  });
  

  usersRouter.post('/uploadAvatar', getToken,async (req, res) => {
    try {
      const fileStr = req.body.data;
      const uploadResponse = await cloudinary.uploader.upload(fileStr,{
        public_id: `${req.user.username}`, 
        folder: 'fakeverse'
      });
      return res.status(200).json({ url: uploadResponse.secure_url });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  });

usersRouter.patch("/bio", getToken, async (req, res) => {
    try {
      const me = req.user;
      const { bio } = req.body;
      if (typeof bio !== "string" || bio.length > 300) {
        return res.status(400).send("Bio must be a string under 300 characters");
      }
      me.biography = bio;
      await me.save();
      return res.status(200).json({ bio: me.biography });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server error");
    }
});
async function generateMachineGodPost() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("⚠️ GEMINI_API_KEY not set");
      return null;
    }
  
    const ai     = new GoogleGenAI({ apiKey });
    const config = {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "text/plain",
    };
    const model    = "gemini-2.5-pro-preview-03-25";
    const contents = [
      { role: "user", parts: [{ text: "Generate a fun, conversational social-media style post." }] }
    ];
  
    try {
      const stream = await ai.models.generateContentStream({ model, config, contents });
      let output = "";
      for await (const chunk of stream) {
        output += chunk.text;
      }
      output = output.trim();
      return output.length > 0 ? output : null;
    } catch (err) {
      console.error("❌ Gemini API error:", err);
      return null;
    }
  }
  

  async function ensureMachineGodPost() {
    try {
      const passwordHash = bcrypt.hashSync(process.env.MACHINE_GOD_PW || "changeme", 10);
      const [machine, created] = await User.findOrCreate({
        where:    { username: "machinegod" },
        defaults: { email: "machinegod@fakeverse.com", password: passwordHash },
      });
  
      const content = await generateMachineGodPost();
      if (!content) {
        console.log("No MachineGod content generated; skipping post.");
        return;
      }
  
      await Post.create({
        content,
        userId:  machine.id,
        username: machine.username,
      });
  
      console.log(`MachineGod posted: "${content.slice(0,60)}…"`);
    } catch (err) {
      console.error("Error in ensureMachineGodPost:", err);
    }
  }

  ensureMachineGodPost();
  setInterval(ensureMachineGodPost, 60 * 1000);

module.exports = usersRouter