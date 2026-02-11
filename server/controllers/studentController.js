// business logic for student operations. E.g., fetching student details, updating profiles, etc.

// updated to only be accessible by users with 'student' role.

const userModel = require("../models/userModel");
const gamificationModel = require("../models/gamificationModel");
const courseModel = require("../models/courseModel");
const internshipModel = require("../models/internshipModel");
const assessmentModel = require("../models/assessmentModel");
const gradeModel = require("../models/gradeModel");
const testAttemptModel = require("../models/testAttemptModel.js");

// NEW for reviews
const reviewModel = require("../models/reviewModel.js");

const admin = require("../config/firebase");

class StudentController {
  // New method to get course progress (content viewed or not)

  // [NEW] Get Course Progress (Viewed vs Total)
  async getCourseProgress(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId } = req.params;

      // 1. Get Viewed Items
      const viewedItems = await gradeModel.getProgress(uid, courseId);

      // 2. Get Total Content
      const course = await courseModel.getCourseById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const totalItems = course.content ? course.content.length : 0;
      const isCompleted = viewedItems.length >= totalItems && totalItems > 0;

      res.status(200).json({
        success: true,
        data: { viewedItems, totalItems, isCompleted },
      });
    } catch (error) {
      next(error);
    }
  }

  // [NEW] Mark Content as Viewed
  async markContentAsViewed(req, res, next) {
    try {
      const uid = req.user.uid;
      const { courseId, contentId } = req.body;

      // Saves to 'grades' collection
      await gradeModel.markItemViewed(uid, courseId, contentId);

      res.status(200).json({ success: true, message: "Progress saved" });
    } catch (error) {
      next(error);
    }
  }

  // [UPDATED] Submit Review
  async submitCourseReview(req, res, next) {
    try {
      const { courseId, review_rating, review_description } = req.body;
      const studentId = req.user.uid;

      // 1. STRICT COMPLETION CHECK
      const viewedItems = await gradeModel.getProgress(studentId, courseId);
      const course = await courseModel.getCourseById(courseId);
      const totalItems = course.content ? course.content.length : 0;

      if (viewedItems.length < totalItems) {
        return res.status(403).json({
          success: false,
          message:
            "Locked: You must complete all course materials before reviewing.",
        });
      }

      // 2. Validate Inputs
      if (!review_rating || !review_description) {
        return res
          .status(400)
          .json({ success: false, message: "Rating and description required" });
      }

      // 3. Overwrite old review
      await reviewModel.hasStudentReviewed(
        courseId,
        studentId,
      );
      

      // 4. Save Review
      const studentProfile = await userModel.getUserById(studentId);
      const studentName = studentProfile
        ? `${studentProfile.firstName} ${studentProfile.lastName}`
        : "Student";

      await reviewModel.addReview({
        courseId,
        studentId,
        studentName,
        rating: Number(review_rating),
        description: review_description,
      });

      // 5. Update Course Rating Stats
      const currentRating = course.rating || 0;
      const currentCount = course.ratingCount || 0;
      const newCount = currentCount + 1;
      const newAverage =
        (currentRating * currentCount + Number(review_rating)) / newCount;

      await courseModel.updateCourse(courseId, {
        rating: newAverage,
        ratingCount: newCount,
      });

      res
        .status(200)
        .json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
      next(error);
    }
  }

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
      const gamificationData =
        await gamificationModel.getStudentGamification(uid);

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
  // updated method with calculated lock/unlock status
  async getAllCourses(req, res, next) {
    try {
      const uid = req.user.uid;

      // 1. Get raw courses
      const courses = await courseModel.getAllCourses();

      // 2. Get Student's progress on ALL courses
      const progressMap = await gradeModel.getAllStudentProgress(uid);

      // 3. Identify completed courses (CourseID Set)
      const completedCourseIds = new Set();
      courses.forEach((c) => {
        const viewed = progressMap[c.id] || [];
        const total = c.content ? c.content.length : 0;
        // Logic: Completed if viewed count >= total content count
        // Note: Empty courses (0 content) are auto-completed
        if (total === 0 || viewed.length >= total) {
          completedCourseIds.add(c.id);
        }
      });

      // 4. Determine Lock Status based on Subject Level & Category
      // Logic:
      // H2 requires >=1 completed H1 in same category.
      // H3 requires >=1 completed H2 in same category.
      const enrichedCourses = courses.map((course) => {
        const level = course.subjectLevel || "H1";
        const category = course.category;
        let isLocked = false;

        if (level === "H2") {
          // Check if user has completed ANY H1 course in this category
          const hasCompletedPrereq = courses.some(
            (c) =>
              c.category === category &&
              (c.subjectLevel === "H1" || !c.subjectLevel) &&
              completedCourseIds.has(c.id),
          );
          if (!hasCompletedPrereq) isLocked = true;
        } else if (level === "H3") {
          // Check if user has completed ANY H2 course in this category
          const hasCompletedPrereq = courses.some(
            (c) =>
              c.category === category &&
              c.subjectLevel === "H2" &&
              completedCourseIds.has(c.id),
          );
          if (!hasCompletedPrereq) isLocked = true;
        }

        // Add calculated flags to the response object
        return {
          ...course,
          subjectLevel: level,
          isLocked: isLocked,
          isCompleted: completedCourseIds.has(course.id),
        };
      });

      res.status(200).json({
        success: true,
        data: enrichedCourses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllInternships(req, res, next) {
    try {
      const internships = await internshipModel.getAllInternships();
      res.status(200).json({
        success: true,
        data: internships,
      });
    } catch (error) {
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
      //await gradeModel.createCourseGrade(uid, courseId);
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
      await gamificationModel.changeGamificationCurrency(uid, 10);

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

  async updateIncentiveTransactionHistory(req, res, next) {
    try {
      console.log("Trying to update transaction History");
      const uid = req.user.uid;
      const { rewardID } = req.body;

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

  async submitAttempt(req, res, next) {
    try {
      console.log("Tyring to submit assessment attempt.");
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

  async submitTestAttempt(req, res, next) {
    try {
      console.log("Tyring to submit test attempt.");
      const uid = req.user.uid;
      const courseid = req.body.CID;
      const assID = req.body.AID;
      const qnData = req.body.qnData;

      console.log(JSON.stringify(req.body));

      await testAttemptModel.submitTestData(uid, assID, courseid, qnData);

      res.status(200).json({
        success: true,
        message: "Successfully submitted test attempt.",
      });
    } catch (error) {
      next(error);
    }
  }

  async checkIfTestAttempted(req, res, next) {
    try {
      const uid = req.user.uid;
      const assID = req.body.assID;

      const outcome = await testAttemptModel.haspreviousattempt(uid, assID);

      res.status(200).json({
        success: true,
        message: "Successfully submitted test attempt.",
        data: {
          outcome: outcome,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async checkIfTestDoneAndMarked(req, res, next){
    try {
      const uid = req.user.uid;
      const assID = req.body.assID;

      const outcome = await gradeModel.getSingleStudentGrade(uid,assID);
      if(outcome === undefined){
        res.status(200).json({
        success: false,
        });
      }
      else{
        res.status(200).json({
        success: true,
        data: {
          outcome: outcome,
        },
        });
      }
      
    } catch (error) {
      next(error);
    }
  }

  async getallgradesbyCID(req, res, next) {
    try {
      const { courseId } = req.params;
      const result = await gradeModel.getGradeByCourseId(courseId);

      res.status(200).json({
        success: true,
        message: "Successfully retreived leaderboard.",
        data: {
          outcome: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getallgradestagtoSID(req, res, next) {
    try {
      const result = await gradeModel.getAllGradesTagToSID();

      res.status(200).json({
        success: true,
        message: "Successfully retreived leaderboard.",
        data: {
          outcome: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async studentSelfDisabledAcc(req, res, next) {
    try {
      const uid = req.user.uid;
      const disable = true;
      await admin.auth().updateUser(uid, { disabled: disable });
      await admin.auth().revokeRefreshTokens(uid);
      await userModel.toggleUserDisabledStatus(uid, disable);
      res.status(200).json({
        success: true,
        message: "Student account disabled successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new StudentController();
