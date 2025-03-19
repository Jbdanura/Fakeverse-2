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
        const user = await User.findOne({where:{username},attributes:["username","id"],
        include:[{model:Post,include:[{model:Like,include:{model:User,attributes:["username"]}},{model:Comment,include:{model:User,attributes:["username"]}}]}],order: [[Post, "createdAt", "DESC"]],})
        console.log(user)
        return res.status(200).send(user)
    } catch (error) {
        return res.status(400).send(error)
    }
})

usersRouter.get("/recommended",async(req,res)=>{
    try {
        const users = await User.findAll({limit: 3,attributes:["username","id"]})
        return res.status(200).send(users)
    } catch (error) {
        return res.status(400).send(error) 
    }

})

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

usersRouter.post("/follow",getToken,async(req,res)=>{
    try {
        const user = req.user
        const userToFollow = await User.findOne({where: {username:req.body.userToFollow}})
        const alreadyFollowing = await Follow.findOne({where:{followingId:userToFollow.id, followerId:user.id}})
        if(alreadyFollowing) console.log("following already")
        if(alreadyFollowing){
            await alreadyFollowing.destroy()
            console.log("destroyed")
            return res.status(200).send(false)
        }
        const follow = await Follow.create({followingId: userToFollow.id, followerId: user.id})
        if(follow){
            console.log("following")
            return res.status(200).send(follow)
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})

usersRouter.post('/uploadImage', getToken,async (req, res) => {
    try {
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr,{
            public_id: `${req.user.username}`,
            folder: 'linkity'
        });
        console.log(uploadResponse);
        res.status(200).send("Image uploaded");
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

module.exports = usersRouter