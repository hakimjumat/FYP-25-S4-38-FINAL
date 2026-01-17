const db = require("../config/db");

class AssessmentModel {
  constructor() {
    this.collection = db.collection("assessments");
  }

  async createAssessment(courseId, data) {
    try {
      // DATA STRUCTURE FOR UNIVERSITY CONTEXT
      // {
      //   title: "Midterm Exam - Calculus 1",
      //   type: "test", // or 'quiz'
      //   totalPoints: 100, // <--- Crucial for Incentives/Grades
      //   timeLimit: 60, // (minutes) <--- Crucial for 'Time Taken' analytics
      //   questions: [
      //      {
      //        id: "q1",
      //        type: "mcq",
      //        text: "Derivative of x^2?",
      //        options: ["2x", "x", "0"],
      //        correct: "2x",
      //        tags: ["derivatives", "easy"] // <--- For Topic Mastery Insights
      //      }
      //   ]
      // }
      const docRef = await this.collection.add({
        courseId,
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // [NEW] Get Assessment details by ID
  async getAssessmentById(assessmentId) {
    try {
      const doc = await this.collection.doc(assessmentId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching assessment: ${error.message}`);
    }
  }

  async deleteAssessment(assessmentId) {
    try {
      await this.collection.doc(assessmentId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting assessment: ${error.message}`);
    }
  }

  async getAllAssessments() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
module.exports = new AssessmentModel();
