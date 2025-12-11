// to implement role-based access control for administrator-specific routes and actions.

// updated to only be accessible by users with 'admin' role.

const userModel = require("../models/userModel");
const { admin } = require("../config/firebase");

/**
 * Admin Controller - Business logic for admin operations
 * Only accessible by users with 'admin' role
 */
class AdminController {
  /**
   * Get all users
   */
  async getAllUsers(req, res, next) {
    try {
      const { role } = req.query; // Optional: filter by role

      let users;
      if (role) {
        users = await userModel.getUsersByRole(role);
      } else {
        // Get all users from Firestore
        const db = require("../config/db");
        const snapshot = await db.collection("users").get();
        users = [];
        snapshot.forEach((doc) => {
          users.push({ uid: doc.id, ...doc.data() });
        });
      }

      res.status(200).json({
        success: true,
        data: {
          users,
          count: users.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
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

  /**
   * Change user role
   */
  async changeUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      const validRoles = ["student", "instructor", "admin"];
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
