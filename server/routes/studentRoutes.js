const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All routes require authentication
router.use(verifyToken);

// All routes require 'student' role
router.use(checkRole(["student"]));

// GET /api/students/profile - Get student profile
router.get("/profile", studentController.getProfile);

// PUT /api/students/profile - Update student profile
router.put("/profile", studentController.updateProfile);

// POST /api/students/points - Add points
router.post("/points", studentController.addPoints);

// POST /api/students/login - Record daily login
router.post("/login", studentController.recordLogin);

module.exports = router;
