const db = require("../config/db");

class testAttemptModel {
    constructor() {
        this.collection = db.collection("testAttempt");
    }

    async submitTestData(uid, testID, courseID, attemptData) {
        //first check if test is in the db
        const docRef = this.collection.doc();
        const doc = await docRef.get();

        if(!doc.exists)
        {
            
        }
        await docRef.set({test_ID: testID, user: uid, course: courseID, questions: attemptData});
    }
}

module.exports = new testAttemptModel(); 