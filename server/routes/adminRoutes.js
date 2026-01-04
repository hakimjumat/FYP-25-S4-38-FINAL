const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All routes require authentication + admin role
router.use(verifyToken);
router.use(checkRole(["admin"])); // Only admins can access

// [STORY 1] Create User
router.post("/users", adminController.createUser);

// [STORY 2 & 3] Get/Search Users
router.get("/users", adminController.getAllUsers);

// [STORY 4] Get specific user
router.get("/users/:userId", adminController.getUserById);

// [STORY 5] Edit User Details
router.put("/users/:userId", adminController.updateUser);

// [STORY 6] Disable/Enable User
router.put("/users/:userId/status", adminController.toggleUserStatus);

// Change Role (Existing)
router.put("/users/:userId/role", adminController.changeUserRole);

// DELETE /api/admin/users/:userId - Delete user
router.delete("/users/:userId", adminController.deleteUser);

// GET /api/admin/stats - Get platform statistics
router.get("/stats", adminController.getStats);

module.exports = router;
