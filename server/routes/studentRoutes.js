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

// POST /api/students/changecurrency - Change Currency Value by input
router.post("/changecurrency", studentController.changeCurrency);

// POST /api/students/login - Record daily login
router.post("/login", studentController.recordLogin);

// POST /api/students/claim-reward - Claim daily login reward
router.post("/claim-reward", studentController.claimReward);

// GET /api/students/courses - Get all courses
router.get("/courses", studentController.getAllCourses);

// POST /api/students/enroll - Enroll in a course
router.post("/enroll", studentController.enrollCourse);

// GET /api/students/getallcourseassessments - Get all assesment
router.get("/getcourseassessment", studentController.getAllAssessment);

// [NEW] Post a review
// POST /api/students/review - Submit course review
router.post("/review", studentController.submitCourseReview);

// GET /api/students/course-progress/:courseId - Get course progress
router.get("/course-progress/:courseId", studentController.getCourseProgress);

// POST /api/students/mark-viewed - Mark content as viewed
router.post("/mark-viewed", studentController.markContentAsViewed);

router.get("/internships", studentController.getAllInternships);

router.post(
  "/updateTransactionHistory",
  studentController.updateIncentiveTransactionHistory
);

router.post("/submitAssessmentAttempt", studentController.submitAttempt);

module.exports = router;
