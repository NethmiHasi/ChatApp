import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
   try {
    const {message} = req.body;
    const {id : receiverId} = req.params;
    const senderId = req.user._id;
    
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    })

    //create new conversation if there is no existing conversation
    if(!conversation){
        conversation =await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    const newMessage = new Message({
        senderId: senderId,
        receiverId: receiverId,
        message: message,

    })

    if (newMessage){
        conversation.messages.push(newMessage);
    }

    //socket io functionality 

    //run in parellel
    await Promise.all([
        await conversation.save(),
        await newMessage.save(),
    ]);

    res.status(201).json(newMessage);

   } catch (error) {
    console.log("Error in sendMessage", error.sendMessage);
    res.status(500).json({ error: "Internal Server Error" });
    
   }
};

export const getMessage = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate('messages'); //get array of messages. not reference but actual messages

        if(!conversation){
            return res.status(200).json([]);
        }

        const messages = conversation.messages;

        res.status(200).json(messages);
        
    } catch (error) {
        console.log("Error in getMessage", error.message);
        res.status(500).json({ error: "Internal Server Error" });
        
    }
}