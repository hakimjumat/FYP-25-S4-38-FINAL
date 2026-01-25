// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// The route for risk analysis
router.post("/risk", analyticsController.getStudentRiskAnalysis);

module.exports = router;