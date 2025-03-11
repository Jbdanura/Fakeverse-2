const postsRouter = require("express").Router()
const User = require("../models/user.js")
const Post = require("../models/post.js")
const Comment = require("../models/comment.js")
const Follow = require("../models/follow.js")
const Like = require("../models/like.js")
const getToken = require("../middleware/token.js")
const {cloudinary} = require("../db.js")

postsRouter.get("/all",async(req,res)=>{
    const posts = await Post.findAll({
        include: [
          {
            model: User,
            attributes: ["username"],
          },
          {model: Like,include:{model:User,attributes:["username"]}},
          {
            model: Comment,
            include: [
              {
                model: User,
                attributes: ["username"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]]
      });
    return res.status(200).json(posts)
})

postsRouter.get("/all/following/:username", async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.params.username } });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const follows = await Follow.findAll({
            where: { followerId: user.id },
        });

        const followingIds = follows.map((follow) => follow.followingId);

        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: { exclude: ['password'] },
                    where: { id: followingIds },
                },{model:Like,include:{model:User,attributes:["username"]}},
                {
                    model: Comment,
                    include: {
                        model: User,
                        attributes: ["username"],
                    },
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).send(posts);
    } catch (error) {
        return res.status(400).send("Server error")
    }
});
postsRouter.post("/new",getToken,async(req,res)=>{
    try {
        const user = req.user
        const postContent = req.body.content
        const fileStr = req.body.fileReady;
        if(postContent.length < 5 || postContent.length > 300){ 
            return res.status(400).send("Post content must be between 5 and 300 characters long")
        }
        const newPost = await Post.create({content:postContent,userId:user.id,username:user.username})
        if(fileStr){
            const uploadResponse = await cloudinary.uploader.upload(fileStr,{
                public_id: `${newPost.id}`,
                folder: 'linkity'
            });
        }
        return res.status(200).send(newPost)
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
postsRouter.post("/edit/:postId",getToken,async(req,res)=>{
    try {
        const user = req.user
        const postId = req.params.postId
        const post = await Post.findByPk(postId,{include:User})
        if(post.user.id == user.id){
            post.content = req.body.editPostContent
            await post.save()
            return res.status(200).send("Post saved")
        } else{
            return res.status(400).send("You are not the owner of that post")
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
postsRouter.delete("/:postId",getToken,async(req,res)=>{
    try {
        const user = req.user
        const postId = req.params.postId
        const post = await Post.findByPk(postId,{include:User})
        if(post.user.id == user.id){
            await post.destroy()
            return res.status(200).send("Post deleted")
        } else{
            return res.status(400).send("You are not the owner of that post")
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
postsRouter.delete("/comment/:commentId",getToken,async(req,res)=>{
    try {
        const user = req.user
        const commentId = req.params.commentId
        const comment = await Comment.findByPk(commentId,{include:User})
        if(comment.user.id == user.id){
            await comment.destroy()
            return res.status(200).send("Comment deleted")
        } else{
            return res.status(400).send("You are not the owner of that post")
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
postsRouter.post("/comment/:postId",getToken,async(req,res)=>{
    try {
        const user = req.user
        const postId = req.params.postId
        const post = await Post.findByPk(postId)
        if(!post) return res.status(400).send("Invalid post id")
        const description = req.body.description
        if(description.length < 5 || description.length > 300){
            return res.status(400).send("Comment too short/too long (<5 or >300)")
        }
        const comment = await Comment.create({description,userId:user.id,postId:post.id})
        return res.status(200).send(comment)
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
postsRouter.post("/like/:postId",getToken,async(req,res)=>{
    try {
        const user = req.user
        const postId = req.params.postId
        const post = await Post.findByPk(postId)
        if(!post) return res.status(400).send("Invalid post id")
        const existsLike = await Like.findOne({where:{postId:post.id,userId:user.id}})
        if(existsLike){
            await existsLike.destroy()
            return res.status(200).send(`Unliked post ${post.id}`)
        } else {
            const newLike = await Like.create({userId: user.id,postId:post.id})
            return res.status(200).send(newLike)
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send("Server error")
    }
})
module.exports = postsRouter