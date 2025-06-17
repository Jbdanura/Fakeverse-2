const chatRouter = require("express").Router()
const getToken = require("../middleware/token")
const Chat = require("../models/chat")
const Message = require("../models/message")
const User = require("../models/user")

chatRouter.post("/chat", getToken, async (req,res) => {
    try {
        const user = req.user;
        const userToId = req.body.userToId;
        const userTo = await User.findOne({where:{id:userToId}});
        if(!userTo) return res.status(400).send("User doesn't exist");
        let userOne;
        let userTwo;
        if (user.id < userTo.id){
            userOne = user;
            userTwo = userTo;
        } else {
            userOne = userTo;
            userTwo = user;
        }
        const chat = await Chat.findOne({where:{userId1:userOne.id, userId2: userTwo.id}})
        if(!chat){
            const newChat = await Chat.create({userId1:userOne.id, userId2: userTwo.id})
            return res.status(200).send(newChat);
        } else {
            return res.status(200);
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send("Error creating chat")
    }
})

chatRouter.get("/chat/:chatId", getToken, async(req,res)=>{
    try {
        const user = req.user;
        const userToId = req.body.userToId;
        const chat = await Chat.findOne({where:{id:req.params.chatId}})
        if(!chat) return res.status(400).send("Chat doesn't exist")
        if((chat.userId1 != user.Id && chat.userId2 != userToId) || (chat.userId1 != userToId && chat.userId2 != user.id)){
            return res.status(400).send("You are not that chat participant");
        }
        const messages = await Message.findAll({where:{chatId:req.params.chatId}})
        return res.status(200).send(messages);
    } catch (error) {
        return res.status(400).send("Error retrieving chat")
    }
})

chatRouter.post("/chat/:chatId/newMessage", getToken, async(req,res)=>{
    try {
        const user = req.user;
        const userToId = req.body.userToId;
        const chat = await Chat.findOne({where:{id:req.params.chatId}})
        if(!chat) return res.status(400).send("Chat doesn't exist")
        if((chat.userId1 != user.Id && chat.userId2 != userToId) || (chat.userId1 != userToId && chat.userId2 != user.id)){
            return res.status(400).send("You are not that chat participant");
        }
        const messageContent = req.body.messageContent;
        if(messageContent.length < 1 || messageContent.length < 500) return res.status(400).send("Message too long/short")
        const message = await Message.create({chatId: req.params.chatId,senderId: user.id, content:messageContent})
        return res.status(200).send(message);
    } catch (error) {
        return res.status(400).send("Error creating message")
    }
})

module.exports = chatRouter