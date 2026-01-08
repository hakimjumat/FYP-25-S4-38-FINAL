const db = require("../config/db");

class InternshipModel {
  constructor() {
    this.collection = db.collection("internships");
  }

  async createPosting(providerId, data) {
    try {
      // DATA STRUCTURE
      // {
      //   title: "Software Engineer Intern",
      //   company: "Tech Corp",
      //   description: "...",
      //   minScore: 75, // <--- The Criteria (Average Grade required)
      //   providerId: "uid_123",
      //   createdAt: ...
      // }
      const docRef = await this.collection.add({
        ...data,
        providerId,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getPostingsByProvider(providerId) {
    try {
      const snapshot = await this.collection
        .where("providerId", "==", providerId)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getPostingById(postingId) {
    const doc = await this.collection.doc(postingId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = new InternshipModel();
