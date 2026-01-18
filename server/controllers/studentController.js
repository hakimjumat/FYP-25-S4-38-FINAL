// business logic for student operations. E.g., fetching student details, updating profiles, etc.

// updated to only be accessible by users with 'student' role.

const userModel = require("../models/userModel");
const gamificationModel = require("../models/gamificationModel");
const courseModel = require("../models/courseModel");
const internshipModel = require("../models/internshipModel");
const assessmentModel = require("../models/assessmentModel");
const gradeModel = require("../models/gradeModel");

class StudentController {
  // Get student profile along with gamification data
  async getProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      const email = req.user.email;

      // verify user is a student
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Access is allowed for students only",
        });
      }

      // Fetch user profile
      const userProfile = await userModel.getUserById(uid);

      // Fetch gamification data
      const gamificationData = await gamificationModel.getStudentGamification(
        uid
      );

      res.status(200).json({
        success: true,
        message: `Profile retrieved for ${email}`,
        data: {
          studentId: uid,
          email,
          role: userProfile.role,
          profile: userProfile,
          gamification: gamificationData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req, res, next) {
    try {
      const courses = await courseModel.getAllCourses();
      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllInternships(req, res, next){
    try{
      const internships = await internshipModel.getAllInternships();
      res.status(200).json({
        success: true,
        data: internships,
      });
    } catch(error){
      next(error);
    }
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

  async enrollCourse(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId } = req.body;

      if (!courseId) {
        return res
          .status(400)
          .json({ success: false, message: "Course ID required" });
      }

      await courseModel.enrollStudent(courseId, uid);
      await gradeModel.createCourseGrade(uid,courseId);
      res.status(200).json({
        success: true,
        message: "Enrolled successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getenrolledCourses(req, res, next) {
    try {
      const uid = req.user.uid;
      // TODO: Fetch enrolled courses from enrollmentModel (not implemented yet)

      res.status(200).json({
        success: true,
        message: `Enrolled courses retrieved for ${uid}`,
        data: {
          courses: [], // Placeholder for enrolled courses
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update student profile
  async updateProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      const updates = req.body;

      await userModel.updateUser(uid, updates);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Add points to student gamification profile
  async addPoints(req, res, next) {
    try {
      const uid = req.user.uid;
      const { points } = req.body;

      if (!points || points <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid points value" + points,
        });
      }

      await gamificationModel.addPoints(uid, points);

      res.status(200).json({
        success: true,
        message: `${points} points added successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  // Record daily login for gamification streaks
  async recordLogin(req, res, next) {
    try {
      const uid = req.user.uid;
      const streakData = await gamificationModel.updateStreak(uid);

      res.status(200).json({
        success: true,
        message: "Login recorded",
        data: streakData,
      });
    } catch (error) {
      next(error);
    }
  }

  async claimReward(req, res, next) {
    try {
      const uid = req.user.uid;
      // harcoding points on server side for security (daily login = +10)
      const result = await gamificationModel.claimDailyReward(uid, 10);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        message: "Daily login reward claimed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Change currency amount in student gamification profile
  async changeCurrency(req, res, next) {
    try {
      const uid = req.user.uid;
      const { points } = req.body;

      console.log(points);

      if (!points) {
        return res.status(400).json({
          success: false,
          message: "Invalid currency value" + points,
        });
      }

      await gamificationModel.changeGamificationCurrency(uid, points);

      res.status(200).json({
        success: true,
        message: `${points} currency added successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateIncentiveTransactionHistory(req, res, next){
    try {
      console.log("Trying to update transaction History");
      const uid = req.user.uid;
      const {rewardID} = req.body;
      
      console.log(rewardID);

      if (!rewardID) {
        return res.status(400).json({
          success: false,
          message: "Invalid rewardID" + rewardID,
        });
      }

      await gamificationModel.addrecord(uid, rewardID);

      res.status(200).json({
        success: true,
        message: `${rewardID} currency added successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req, res, next){
    try{
      console.log("Tyring to submit assessment attempt.")
      const uid = req.user.uid;
      const courseid = req.body.CID;
      const assID = req.body.AID;
      const datatobesent = req.body.datatobesent;

      console.log(JSON.stringify(req.body));

      await gradeModel.submitTestAttempt(uid, courseid, assID, datatobesent);

      res.status(200).json({
        success: true,
        message: "Successfully submitted attempt.",
      });
    } catch (error) {
      next(error);
    }
  }

}
module.exports = new StudentController();
