// to implement role-based access control for administrator-specific routes and actions.

// updated to only be accessible by users with 'admin' role.

const userModel = require("../models/userModel");
const admin = require("../config/firebase");

/**
 * Admin Controller - Business logic for admin operations
 * Only accessible by users with 'admin' role
 */
class AdminController {
  // [STORY 1] Create User Accounts
  async createUser(req, res, next) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !role) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // 1. Create in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
        disabled: false,
      });

      // 2. Set Custom Claims (Role)
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      // 3. Create Profile in Firestore
      await userModel.createUser(userRecord.uid, {
        email,
        firstName,
        lastName,
        role,
        isDisabled: false, // Default status
      });

      res.status(201).json({
        success: true,
        message: "User account created successfully",
        data: { uid: userRecord.uid, email, role },
      });
    } catch (error) {
      // Handle "Email already exists" error specific to Firebase
      if (error.code === "auth/email-already-exists") {
        return res
          .status(409)
          .json({ success: false, message: "Account already exists" });
      }
      next(error);
    }
  }

  // [STORY 2 & 3] View All & Search
  async getAllUsers(req, res, next) {
    try {
      const { role, search } = req.query;

      // 1. Get all users (or filter by role if provided)
      let users;
      if (role) {
        users = await userModel.getUsersByRole(role);
      } else {
        const db = require("../config/db");
        const snapshot = await db.collection("users").get();
        users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      }

      // 2. Filter in memory (Basic search)
      if (search) {
        const lowerSearch = search.toLowerCase();
        users = users.filter(
          (user) =>
            (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
            (user.firstName &&
              user.firstName.toLowerCase().includes(lowerSearch)) ||
            (user.lastName && user.lastName.toLowerCase().includes(lowerSearch))
        );
      }

      res.status(200).json({
        success: true,
        data: { users, count: users.length },
      });
    } catch (error) {
      next(error);
    }
  }

  // [STORY 4] get user by ID
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await userModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // [STORY 5] Update User Details
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updates = req.body; // { firstName, lastName, phone... }

      // Update Firestore
      await userModel.updateUserProfile(userId, updates);

      // Optional: Update Auth Display Name if names changed
      if (updates.firstName || updates.lastName) {
        await admin.auth().updateUser(userId, {
          displayName: `${updates.firstName} ${updates.lastName}`,
        });
      }

      res.status(200).json({ success: true, message: "Changes Saved" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user role
   */
  async changeUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      const validRoles = [
        "student",
        "instructor",
        "admin",
        "internshipprovider",
      ];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
      }

      // Update role in Firestore
      await userModel.changeUserRole(userId, newRole);

      // Set custom claim in Firebase Auth
      await admin.auth().setCustomUserClaims(userId, { role: newRole });

      res.status(200).json({
        success: true,
        message: `User role changed to ${newRole}`,
        data: { userId, newRole },
      });
    } catch (error) {
      next(error);
    }
  }

  // [STORY 6] Disable Account
  async toggleUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { disable } = req.body; // boolean true/false

      // 1. Update Firebase Auth (Prevents login)
      await admin.auth().updateUser(userId, { disabled: disable });

      // 2. Update Firestore (For UI display)
      await userModel.toggleUserDisabledStatus(userId, disable);

      res.status(200).json({
        success: true,
        message: disable ? "Account Disabled" : "Account Enabled",
      });
    } catch (error) {
      next(error);
    }
  }

  // delete user
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      // Delete from Firestore
      await userModel.deleteUser(userId);

      // Delete from Firebase Auth
      await admin.auth().deleteUser(userId);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // get platform statistics
  async getStats(req, res, next) {
    try {
      const students = await userModel.getUsersByRole("student");
      const instructors = await userModel.getUsersByRole("instructor");
      const admins = await userModel.getUsersByRole("admin");

      res.status(200).json({
        success: true,
        data: {
          totalUsers: students.length + instructors.length + admins.length,
          students: students.length,
          instructors: instructors.length,
          admins: admins.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
