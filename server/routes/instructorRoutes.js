const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructorController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All routes require authentication
router.use(verifyToken);

// All routes require 'admin' role
router.use(checkRole(["instructor"]));

// GET /api/instructor/profile - Get instructor profile
router.get("/profile", instructorController.getProfile);

// POST /api/instructor/create-course - create a new course
router.post("/create-course", instructorController.createCourse);

// POST /api/instructor/add-content - add content to a course
router.post("/add-content", instructorController.addCourseContent);

// GET /api/instructor/my-courses - Get all courses created by the instructor
router.get("/my-courses", instructorController.getMyCourses);

// POST /api/instructors/add-assessment - Create a new assessment for a course
router.post(
  "/add-assessment",
  verifyToken,
  checkRole("instructor"),
  instructorController.createAssessment
);

// TODO in future...
// GET /api/instructors/students - Get all students in instructor's courses
router.get("/students", instructorController.getStudents);

// POST /api/instructors/award-badge - Award badge to student
router.post("/award-badge", instructorController.awardBadge);

router.put("/update-course", instructorController.updateCourse);

router.delete("/delete-course/:courseId", instructorController.deleteCourse);

router.delete(
  "/remove-content/:courseId/:contentId",
  instructorController.removeContent
);

// GET /api/instructors/students/:courseId
router.get("/students/:courseId", instructorController.getCourseStudents);

module.exports = router;
