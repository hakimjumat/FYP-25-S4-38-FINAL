// to implement business logic for instructor-related operations. E.g., fetching instructor details, updating profiles, create courses, etc.

// updated to only be accessible by users with 'instructor' role.

const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");

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

      const courses = await courseModel.getCoursesByInstructor(req.user.uid);

      res.status(200).json({
        success: true,
        message: `Courses retrieved for instructor ${uid}`,
        data: courses, // Placeholder for instructor's courses
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new empty course
  async createCourse(req, res, next) {
    try {
      const { title, description } = req.body;
      const instructorId = req.user.uid;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      // issue for name being null or undefined
      let instructorName = "Unknown Instructor";
      try {
        const userProfile = await userModel.getUserById(instructorId);
        if (userProfile && userProfile.firstName) {
          instructorName = `${userProfile.firstName} ${userProfile.lastName}`;
        } else if (req.user.email) {
          instructorName = req.user.email; // Fallback to email if name missing
        }
      } catch (err) {
        console.warn("Could not fetch instructor name, using default.");
      }

      const newCourse = await courseModel.createCourse({
        title,
        description,
        instructorId,
        instructorName, // <--- Now this is guaranteed to be a string
      });

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCourseContent(req, res, next) {
    try {
      const uid = req.user.uid;
      // fileUrl comes from client after uploading to Firebase Storage
      const { courseId, title, fileUrl, type } = req.body;
      if (!courseId || !title || !fileUrl) {
        return res.status(400).json({
          success: false,
          message: "Missing content details",
        });
      }
      const updatedContent = await courseModel.addCourseContent(courseId, {
        title,
        fileUrl,
        type: type || "document",
      });

      res.status(200).json({
        success: true,
        message: `Content added to course ${courseId} by instructor ${uid}`,
        data: updatedContent,
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

  //new methods
  async updateCourse(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId, title, description } = req.body;
      await courseModel.updateCourse(courseId, { title, description });

      res.status(200).json({
        success: true,
        message: `Course ${courseId} updated successfully by instructor ${uid}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId } = req.params;
      await courseModel.deleteCourse(courseId);
      res.status(200).json({
        success: true,
        message: `Course ${courseId} deleted successfully by instructor ${uid}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeContent(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId, contentId } = req.params;
      const updatedContent = await courseModel.removeContent(
        courseId,
        contentId
      );
      res.status(200).json({
        success: true,
        message: `Content ${contentId} removed from course ${courseId} by instructor ${uid}`,
        data: updatedContent,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstructorController();
