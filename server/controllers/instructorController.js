// to implement business logic for instructor-related operations. E.g., fetching instructor details, updating profiles, create courses, etc.

// updated to only be accessible by users with 'instructor' role.

const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");
const assessmentModel = require("../models/assessmentModel");
const testAttemptModel = require("../models/testAttemptModel");
const GradeModel = require("../models/gradeModel");

class InstructorController {
  // [NEW] Get full details of a specific assessment
  async getAssessment(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const assessment = await assessmentModel.getAssessmentById(assessmentId);

      if (!assessment) {
        return res
          .status(404)
          .json({ success: false, message: "Assessment not found" });
      }

      res.status(200).json({ success: true, data: assessment });
    } catch (error) {
      next(error);
    }
  }

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

  // new get students for a specific course
  async getCourseStudents(req, res, next) {
    try {
      const { courseId } = req.params;

      // 1. Get the course to find enrolled IDs
      const course = await courseModel.getCourseById(courseId);
      if (!course) throw new Error("Course not found");

      // Security check: ensure instructor owns this course
      if (course.instructorId !== req.user.uid) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const studentIds = course.enrolledStudents || [];

      // 2. Fetch user details for each ID
      // (Assuming userModel has a method to get multiple users or we loop)
      const studentsDetails = [];
      for (const studentId of studentIds) {
        const user = await userModel.getUserById(studentId);
        if (user) {
          studentsDetails.push(user);
        }
      }

      res.status(200).json({
        success: true,
        data: studentsDetails,
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
      const { title, description, category } = req.body;
      const instructorId = req.user.uid;

      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message: "Title, description, and category are required",
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
        category,
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

  async createAssessment(req, res, next) {
    try {
      const { courseId, title, type, questions, timeLimit, totalPoints, weightage } =
        req.body;

      // 1. SAVE HEAVY DATA: Create the document in 'assessments' collection
      const assessment = await assessmentModel.createAssessment(courseId, {
        title,
        type,
        questions,
        timeLimit,
        totalPoints,
        weightage,
      });

      // 2. SAVE REFERENCE: Add a "shortcut" to the 'courses' collection so it shows up in editing/deleting courses
      await courseModel.addCourseContent(courseId, {
        id: assessment.id, // Use the real ID from the assessment collection
        title: title,
        type: type, // 'quiz' or 'test'
        totalPoints: totalPoints,
      });

      res.status(201).json({ success: true, data: assessment });
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

      // 1. We need to see what this content is before we delete it
      const course = await courseModel.getCourseById(courseId);
      if (!course) throw new Error("Course not found");

      // 2. FIND THE CONTENT ITEM
      const contentItem = course.content.find((item) => item.id === contentId);

      if (contentItem) {
        // 3. CHECK: IS IT AN ASSESSMENT?
        if (contentItem.type === "quiz" || contentItem.type === "test") {
          console.log(`Deleting Assessment Doc: ${contentId}`);
          // Delete the "Heavy Data" from assessments collection
          await assessmentModel.deleteAssessment(contentId);
        }
      }

      // remove content reference from course
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

  async getAllTestAttempts(req, res, next){
    //const testId = req.body.testid;

    const snapshot = await testAttemptModel.pullalldata();

    if(snapshot.empty){
      console.log("No documents found.")

    }

    res.status(200).json({
      success: true,
      message: "Found Documents",
      data: snapshot,
    });
  }

  async getAllAssessment(req, res, next) {
      try {
        //need to change to a function to get data from assessment table
        //console.log(req);
        const assessment = await assessmentModel.getAllAssessments();
        res.status(200).json({
          success: true,
          data: assessment,
        });
      } catch (error) {
        next(error);
      }
    }

    async uploadStudentGrade(req, res, next){
      try{
        const studentId = req.body.sid;
        const courseId = req.body.cid;
        const testId = req.body.tid;
        const data = req.body.newgrade;

        await GradeModel.submitTestAttempt(studentId, courseId, testId, data);

        res.status(200).json({
          success: true,
        });
      }
      catch (error) {
        next(error);
      }
    }

    async FetchSingleGrade(req, res, next){
      try{
        const studentId = req.body.sid;
        const courseId = req.body.cid;

        const data = await GradeModel.getSingleStudentGrade(studentId, courseId);

        res.status(200).json({
          success: true,
          data: data,
        });
      }
      catch (error) {
        next(error);
      }
    }

    async calculateTotalGrade(req, res, next){
      try{
        const studentId = req.body.sid;
        const courseId = req.body.cid;
        const newTotalGrade = req.body.newTG;

        await GradeModel.UpdateSingleStudentGrade(studentId, courseId, newTotalGrade);

        res.status(200).json({
          success: true,
        });
      }
      catch (error) {
        next(error);
      }
    }

    async deleteGradedAttempt(req, res, next){
      try {
      const uid = req.user.uid;
      const { attemptId } = req.params;
      await testAttemptModel.deleteItem(attemptId);
      res.status(200).json({
        success: true,
        message: `Attempt ${attemptId} deleted successfully by instructor ${uid}`,
      });
    } catch (error) {
      next(error);
    }
    }
    
}

module.exports = new InstructorController();
