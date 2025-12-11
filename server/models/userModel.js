// to handle user related crud database operations e.g create, read, update, delete
const db = require("../config/db");

class UserModel {
  constructor() {
    this.collection = db.collection("users");
  }

  // create a new user profile in Firestore
  async createUser(uid, userData) {
    try {
      await this.collection.doc(uid).set({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true, uid };
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  }

  // get user profile by uid
  async getUserById(uid) {
    try {
      const doc = await this.collection.doc(uid).get();
      if (!doc.exists) {
        throw new Error("User not found");
      }
      return { uid: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error("Error fetching user: " + error.message);
    }
  }

  // update user profile

  async updateUser(uid, updates) {
    try {
      await this.collection.doc(uid).update({
        ...updates,
        updatedAt: new Date(),
      });
      return { succes: true };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // delete user profile
  async deleteUser(uid) {
    try {
      await this.collection.doc(uid).delete();
      return { success: true };
    } catch (error) {
      throw new Error("Error deleting user: " + error.message);
    }
  }
}

module.exports = new UserModel();
