const userModel = require("../models/userModel");
const msgModel = require("../models/messagesModel");
//const admin = require("../config/firebase");

class messagesController {
    async sendMessage(req, res, next){
        //send message to DB
        let uid = req.user.uid;
        let data = req.body;
        try{
            let result= await msgModel.sendMessageToDB(uid, data);

            res.status(201).json({
                success: true,
                message: "Message sent successfully",
            });
        }
        catch(error){

        }
    }

    async getMyMessages(req, res, next){
        //get any message with your UID as recipeint
        let uid = req.user.uid;
        try{
            let msgs = await msgModel.getAllMessagesForUser(uid);

            res.status(201).json({
                success: true,
                message: "Messages loaded successfully",
                data: {msgs}
            });
        }
        catch(error){
            next(error);
        }
    }

    async getSentItems(req, res, next){
        //get any message with your UID as sender
    }

    async getReciverUser(req, res, next){
        try{
            let users = await userModel.getAllUsers();

            res.status(200).json({
                success: true,
                data: { users },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new messagesController()