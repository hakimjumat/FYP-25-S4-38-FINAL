// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// POST /api/auth/create-profile - Create user profile after registration
router.post("/create-profile", authController.createUserProfile);

// GET /api/auth/current-user - Get current authenticated user
router.get("/current-user", verifyToken, authController.getCurrentUser);

module.exports = router;
