const express = require("express");
const router = express.Router();

// Import all route modules
const studentRoutes = require("./studentRoutes");
// const courseRoutes = require("./courseRoutes");
const authRoutes = require("./authRoutes");

// Mount routes
router.use("/students", studentRoutes);
// router.use("/courses", courseRoutes);
router.use("/auth", authRoutes);

// Health check route
router.get("/status", (req, res) => {
  res.json({
    success: true,
    status: "Server is running perfectly!",
    timestamp: new Date().toISOString(),
  });
});

// Test route that returns sample data
router.get("/test-data", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    sampleData: {
      name: "Test User",
      points: 999,
      level: 5,
      badges: ["Test Badge 1", "Test Badge 2"],
    },
  });
});

module.exports = router;
