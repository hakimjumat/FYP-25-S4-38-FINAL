// to handle user related crud database operations e.g create, read, update, delete

// Updated to support multiple roles like student, instructor, admin.

const db = require("../config/db");

class UserModel {
  constructor() {
    this.collection = db.collection("users");
  }

  getValidRoles() {
    return ["student", "instructor", "admin", "internshipprovider"];
  }

  // create a new user profile in Firestore
  async createUser(uid, userData) {
    try {
      const { role = "student", ...otherData } = userData; // default role is student

      // validate role
      if (!this.getValidRoles().includes(role)) {
        throw new Error(`Invalid role specified: ${role}`);
      }

      await this.collection.doc(uid).set({
        ...otherData,
        role,
        accountType: role, // for backward compatibility
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, uid, role };
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  }

  // NEW Method that matches style of getCoursesByInstructor

  async getAllUsers() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error("Error fetching all users: " + error.message);
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

  // get user role by uid
  async getUserRole(uid) {
    try {
      const user = await this.getUserById(uid);
      return user ? user.role : null;
    } catch (error) {
      throw new Error("Error fetching user role: " + error.message);
    }
  }

  // get all users by role
  async getUsersByRole(role) {
    try {
      const snapshot = await this.collection.where("role", "==", role).get();
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      throw new Error("Error fetching users by role: " + error.message);
    }
  }

  // update user profile
  // updated to not allow role change via this method

  async updateUserProfile(uid, updates) {
    try {
      // dont allow role update via this method
      const { role, ...safeUpdates } = updates;
      await this.collection.doc(uid).update({
        ...safeUpdates,
        updatedAt: new Date().toISOString(),
      });
      return { succes: true };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Toggle Disable Status
  async toggleUserDisabledStatus(uid, isDisabled) {
    try {
      await this.collection.doc(uid).update({
        isDisabled: isDisabled,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, isDisabled };
    } catch (error) {
      throw new Error(`Error updating disabled status: ${error.message}`);
    }
  }

  // change user role (admin only)
  async changeUserRole(uid, newRole) {
    try {
      if (!this.getValidRoles().includes(newRole)) {
        throw new Error(`Invalid role specified: ${newRole}`);
      }
      await this.collection.doc(uid).update({
        role: newRole,
        accountType: newRole,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, newRole };
    } catch (error) {
      throw new Error(`Failed to change user role: ${error.message}`);
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
