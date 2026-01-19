const db = require("../config/db");

class ReviewModel {
  constructor() {
    this.collection = db.collection("reviews");
  }

  // Check if a student has already reviewed this course
  async hasStudentReviewed(courseId, studentId) {
    try {
      const snapshot = await this.collection
        .where("courseId", "==", courseId)
        .where("studentId", "==", studentId)
        .get();
      return !snapshot.empty; // Returns true if review exists
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addReview(reviewData) {
    try {
      // Data Structure:
      // {
      //   courseId: "...",
      //   studentId: "...",
      //   studentName: "...",
      //   rating: 4,
      //   description: "Great course, learned a lot!",
      //   createdAt: ...
      // }

      const docRef = await this.collection.add({
        ...reviewData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...reviewData };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Helper to check if student already reviewed this course
  async hasStudentReviewed(courseId, studentId) {
    const snapshot = await this.collection
      .where("courseId", "==", courseId)
      .where("studentId", "==", studentId)
      .get();
    return !snapshot.empty;
  }
}

module.exports = new ReviewModel();
