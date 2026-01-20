const db = require("../config/db");

class messagesModel {
    constructor() {
        this.collection = db.collection("messages");
    }

    async sendMessageToDB(uid, messageData){
        try{
            const docRef = this.collection.doc();
            const doc = await docRef.get();

            if(!doc.exists)
            {
                
            }

            await docRef.set(messageData);
        }
        catch(error){
            throw new Error(error.message);
        }
    }

    async getAllMessagesForUser(uid){
        const snapshot = await this.collection.where("reciver_user_id", "==", uid).get();
        const x = [];
        
        if (snapshot.empty) {
            console.log("No matching documents.");
            return;
        }
        snapshot.forEach((doc) => {
            //there should only be one
            console.log(doc.id, "=>", doc.data());
            x.push(doc.data());
        });


        

        return x;
    }
}

module.exports = new messagesModel();