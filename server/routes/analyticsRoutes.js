// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// analysis route for student
router.post("/risk", analyticsController.getStudentRiskAnalysis);
router.post("/overall-student-stats", analyticsController.getOverallStudentStats);

// analysis route for instructor
router.post("/instructor-report", analyticsController.getInstructorCourseReport);
router.post("/grouped-report", analyticsController.getGroupedAssessmentReport);

module.exports = router;