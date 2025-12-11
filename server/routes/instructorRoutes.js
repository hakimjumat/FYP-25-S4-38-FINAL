const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All routes require authentication
router.use(verifyToken);

// All routes require 'admin' role
router.use(checkRole(["admin"]));

// GET /api/admin/users - Get all users (optional role filter)
router.get("/users", adminController.getAllUsers);

// GET /api/admin/users/:userId - Get user by ID
router.get("/users/:userId", adminController.getUserById);

// DELETE /api/admin/users/:userId - Delete user
router.delete("/users/:userId", adminController.deleteUser);

// PUT /api/admin/users/:userId/role - Change user role
router.put("/users/:userId/role", adminController.changeUserRole);

// GET /api/admin/stats - Get platform statistics
router.get("/stats", adminController.getStats);

module.exports = router;
