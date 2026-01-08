const internshipModel = require("../models/internshipModel");
const gradeModel = require("../models/gradeModel");
const userModel = require("../models/userModel");

class InternshipController {
  // 1. Create a Job Posting
  async createPosting(req, res, next) {
    try {
      const { title, company, description, minScore } = req.body;
      const providerId = req.user.uid;

      const posting = await internshipModel.createPosting(providerId, {
        title,
        company,
        description,
        minScore: parseInt(minScore) || 0,
      });

      res.status(201).json({ success: true, data: posting });
    } catch (error) {
      next(error);
    }
  }

  // 2. Get My Postings
  async getMyPostings(req, res, next) {
    try {
      const providerId = req.user.uid;
      const postings = await internshipModel.getPostingsByProvider(providerId);
      res.status(200).json({ success: true, data: postings });
    } catch (error) {
      next(error);
    }
  }

  // 3. THE MATCHING ALGORITHM (Get Candidates)
  async getCandidates(req, res, next) {
    try {
      const { postingId } = req.params;

      // A. Get the Job Criteria
      const posting = await internshipModel.getPostingById(postingId);
      if (!posting)
        return res.status(404).json({ message: "Posting not found" });

      const minRequired = posting.minScore || 0;

      // B. Get All Students
      const students = await userModel.getUsersByRole("student");

      // C. Filter Students based on Grades
      const qualifiedStudents = [];

      for (const student of students) {
        // Fetch this student's grades
        const grades = await gradeModel.getStudentGrades(student.uid);

        // Calculate Average Score
        if (grades.length > 0) {
          const total = grades.reduce((sum, g) => sum + (g.score || 0), 0);
          const average = total / grades.length;

          // CHECK CRITERIA
          if (average >= minRequired) {
            qualifiedStudents.push({
              name: `${student.firstName} ${student.lastName}`,
              email: student.email,
              averageScore: average.toFixed(1),
              totalAssessments: grades.length,
              detailedGrades: grades, // Include details if needed
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        criteria: { minScore: minRequired },
        data: qualifiedStudents,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InternshipController();
