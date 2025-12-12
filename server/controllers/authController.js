// server/controllers/authController.js

const admin = require("../config/firebase");
const userModel = require("../models/userModel");
const gamificationModel = require("../models/gamificationModel");

class AuthController {
  //Create user profile in Firestore after Auth registration
  // will be called from React RegisterPage after successful Firebase Auth signup

  async createUserProfile(req, res, next) {
    try {
      const { uid, email, firstName, lastName, role, avatar } = req.body;

      // field valitation
      if (!uid || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: uid, email, firstName, lastName",
        });
      }

      const validRoles = ["student", "instructor", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
        });
      }

      await userModel.createUser(uid, {
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role,
        accountType: role,
        avatar: avatar || "👨‍🎓", // Default if none selected
      });

      // set custom claims in Firebase Auth for role-based access
      await admin.auth().setCustomUserClaims(uid, { role });

      // initialize gamification profile for student only
      if (role === "student") {
        await gamificationModel.addPoints(uid, 0); // Initialize gamification profile
      }

      res.status(201).json({
        success: true,
        message: `${role} profile created successfully`,
        data: { uid, email, firstName, lastName, role },
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const uid = req.user.uid;
      const userProfile = await userModel.getUserById(uid);

      res.status(200).json({
        success: true,
        message: "Current user fetched successfully",
        data: {
          uid,
          ...userProfile,
        },
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      const updates = req.body; // {firstName, lastName, avatar, etc.}

      // Security: Prevent updating the role via this endpoint
      delete updates.role;
      delete updates.email; // Email updates require Firebase Auth logic, not just DB

      await userModel.updateUserProfile(uid, updates);

      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      next(error);
    }
  }
}

module.exports = new AuthController();
