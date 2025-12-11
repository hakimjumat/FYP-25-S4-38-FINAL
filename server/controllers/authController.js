// server/controllers/authController.js

const admin = require("../config/firebase");
const userModel = require("../models/userModel");
const gamificationModel = require("../models/gamificationModel");

class AuthController {
  //Create user profile in Firestore after Auth registration
  // will be called from React RegisterPage after successful Firebase Auth signup

  async createUserProfile(req, res, next) {
    try {
      const { uid, email, firstName, lastName, role = "student" } = req.body;

      // field valitation
      if (!uid || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: uid, email, firstName, lastName",
        });
      }

      await userModel.createUser(uid, {
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role,
        accountType: role,
      });

      await gamificationModel.addPoints(uid, 0); // Initialize gamification profile

      res.status(201).json({
        success: true,
        message: "User profile created successfully",
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
        data: userProfile,
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      next(error);
    }
  }
}

module.exports = new AuthController();
