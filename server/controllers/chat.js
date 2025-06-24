const chatRouter = require("express").Router()
const getToken = require("../middleware/token")
const Chat = require("../models/chat")
const Message = require("../models/message")
const User = require("../models/user")
const { Op } = require("sequelize");

chatRouter.post("/chat", getToken, async (req,res) => {
    try {
        const messageChat = req.body.message
        if(messageChat.length < 1 || messageChat.length > 500) return res.status(400).send("Message too long/short")
        const user = req.user;
        const usernameToFind = req.body.username
        const userToFind = await User.findOne({where:{username:usernameToFind}})
        if (!userToFind) return res.status(400).send("User doesn't exist");
        const userToId = userToFind.id;
        if(user.id == userToId) return res.status(400).send("You can't message yourself")
        const userTo = await User.findOne({where:{id:userToId}});
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
            await newChat.save();
            console.log("created chat")
            const message = await Message.create({chatId: newChat.id,senderId: user.id, content:messageChat})
            console.log("created message",message)
            await message.save()
            return res.status(200).json(newChat);
        } else {
            console.log("chat",chat)
            return res.status(200).json(chat);
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json("Error creating chat")
    }
})

chatRouter.get("/userChats",getToken,async(req,res)=>{
    try {
        const userId = req.user.id;
        const userChats = await Chat.findAll({where:{[Op.or]: [{userId1: userId},{userId2:userId}]}, attributes: ["id"]});
        return res.status(200).send(userChats);
    } catch (error) {
        return res.status(400).send("Error getting user chats")
    }
})

chatRouter.get("/chat/:chatId", getToken, async(req,res)=>{
    try {
      const user = req.user;
      const chat = await Chat.findOne({ where: { id: req.params.chatId } });
      if (!chat) {
        return res.status(400).send("Chat doesn't exist");
      }
      if (chat.userId1 !== user.id && chat.userId2 !== user.id) {
        return res.status(400).send("You are not that chat participant");
      }

      const messages = await Message.findAll({
        where: { chatId: req.params.chatId },
        attributes: ["id", "chatId", "senderId", "content", "sentAt"],
        order: [["sentAt", "ASC"]],
      });

      const senderIds = Array.from(new Set(messages.map(m => m.senderId)));

      const senders = await User.findAll({
        where: { id: senderIds },
        attributes: ["id", "username"]
      });
      const usernameById = senders.reduce((acc, u) => {
        acc[u.id] = u.username;
        return acc;
      }, {});



      const result = messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        senderUsername: usernameById[m.senderId] || "",
        content: m.content,
        sentAt: m.sentAt
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).send("Error retrieving chat");
    }
  }
);

chatRouter.get("/chat/:chatId/lastMessage",getToken, async(req,res)=>{
    try {
        const user = req.user;
        const chat = await Chat.findOne({where:{id:req.params.chatId}})
        if(!chat) return res.status(400).send("Chat doesn't exist")
        if(chat.userId1 != user.id && chat.userId2 != user.id){
            return res.status(400).send("You are not that chat participant");
        }

        const lastMessage = await Message.findOne({
            where: {chatId: req.params.chatId},
            order: [["createdAt", "DESC"]],
            attributes: ["id","chatId","senderId","content","sentAt"]})

        if (!lastMessage) {
            return res.status(200).json(null) 
        }

        const sender = await User.findByPk(lastMessage.senderId, {
            attributes: ["username"],
        });
        const otherUserId = chat.userId1 === user.id ? chat.userId2 : chat.userId1;
        const other = await User.findByPk(otherUserId, {
            attributes: ["username"],
        });
        const otherUsername = other?.username || "";
        return res.status(200).json({
            id: lastMessage.id,
            chatId: lastMessage.chatId,
            senderId: lastMessage.senderId,
            senderUsername: sender ? sender.username : null,
            otherUsername,
            content: lastMessage.content,
            sentAt: lastMessage.sentAt,
        })
        
    } catch (error) {
        console.log(error)
        return res.status(400).send("Error retrieving chat")
    }
})

chatRouter.post("/chat/:chatId/newMessage", getToken, async(req,res)=>{
    try {
        const user = req.user;
        const chat = await Chat.findOne({where:{id:req.params.chatId}})
        if(!chat) return res.status(400).send("Chat doesn't exist")
            console.log(chat,user)
        if(chat.userId1 !== user.id && chat.userId2 !== user.id){
            return res.status(400).send("You are not that chat participant");
        }
        const messageContent = req.body.messageContent;
        if(messageContent.length < 1 || messageContent.length > 500) return res.status(400).send("Message too long/short")
        const message = await Message.create({chatId: req.params.chatId,senderId: user.id, content:messageContent})
        return res.status(200).send(message);
    } catch (error) {
        return res.status(400).send("Error creating message")
    }
})

module.exports = chatRouter