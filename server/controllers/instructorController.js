// to implement business logic for instructor-related operations. E.g., fetching instructor details, updating profiles, create courses, etc.

// updated to only be accessible by users with 'instructor' role.

const userModel = require("../models/userModel");

class InstructorController {
  // Get instructor profile
  async getProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      const email = req.user.email;

      const userProfile = await userModel.getUserById(uid);

      res.status(200).json({
        success: true,
        message: `Profile retrieved for ${email}`,
        data: {
          instructorId: uid,
          email,
          role: userProfile.role,
          profile: userProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // getting all courses created by the instructor
  async getMyCourses(req, res, next) {
    try {
      const uid = req.user.uid;

      // TODO: Fetch courses created by the instructor from courseModel (not implemented yet)

      res.status(200).json({
        success: true,
        message: `Courses retrieved for instructor ${uid}`,
        data: {
          courses: [], // Placeholder for instructor's courses
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      const uid = req.user.uid;
      const { title, description } = req.body;

      // TODO: Implement course creation logic in courseModel (not implemented yet)

      res.status(201).json({
        success: true,
        message: `Course created successfully by instructor ${uid}`,
        data: {
          courseId: "temp-id", // Placeholder for new course ID
          instructorId: uid,
          title,
          description,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudents(req, res, next) {
    try {
      const uid = req.user.uid;

      //TODO: Fetch students enrolled in instructor's courses from enrollmentModel (not implemented yet)

      res.status(200).json({
        success: true,
        message: `Students retrieved for instructor ${uid}`,
        data: {
          students: [], // Placeholder for students list
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async awardBadge(req, res, next) {
    try {
      const uid = req.user.uid;
      const { studentId, badgeName } = req.body;

      if (!studentId || !badgeName) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: studentId, badgeName",
        });
      }

      const gamificationModel = require("../models/gamificationModel");
      await gamificationModel.awardBadge(studentId, badgeName);

      res.status(200).json({
        success: true,
        message: `Badge '${badgeName}' awarded to student ${studentId} by instructor ${uid}`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstructorController();
