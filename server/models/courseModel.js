// to handle course related crud database operations e.g create, read, update, delete
const db = require("../config/db");
const reviewModel = require("./reviewModel");

class CourseModel {
  constructor() {
    this.collection = db.collection("courses");
  }

  async createCourse(courseData) {
    try {
      const docRef = await this.collection.add({
        ...courseData,
        category: courseData.category || "General",
        rating: 0, //start at 0 stars
        ratingCount: 0, //track how many ratings received
        content: [], // Array to store lessons/files
        enrolledStudents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...courseData };
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  async addCourseContent(courseId, contentItem) {
    try {
      const courseRef = this.collection.doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) throw new Error("Course not found");

      // Append new content to the array
      const currentContent = courseDoc.data().content || [];
      const updatedContent = [
        ...currentContent,
        {
          id: Date.now().toString(), // Simple ID generation
          ...contentItem,
          addedAt: new Date().toISOString(),
        },
      ];

      await courseRef.update({
        content: updatedContent,
        updatedAt: new Date().toISOString(),
      });

      return updatedContent;
    } catch (error) {
      throw new Error(`Error adding content: ${error.message}`);
    }
  }

  async updateCourse(courseId, updates) {
    try {
      await this.collection.doc(courseId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  async deleteCourse(courseId) {
    try {
      await this.collection.doc(courseId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  async removeContent(courseId, contentId) {
    try {
      const courseRef = this.collection.doc(courseId);
      const doc = await courseRef.get();

      if (!doc.exists) throw new Error("Course not found");

      const currentContent = doc.data().content || [];
      const updatedContent = currentContent.filter(
        (item) => item.id !== contentId
      );

      await courseRef.update({
        content: updatedContent,
        updatedAt: new Date().toISOString(),
      });

      return updatedContent;
    } catch (error) {
      throw new Error(`Error removing content: ${error.message}`);
    }
  }

  // UPDATED: Get all courses for the Student Course Page including reviews
  async getAllCourses() {
    try {
      const snapshot = await this.collection.get();
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Attach reviews
      for (const course of courses) {
        course.reviews = await reviewModel.getReviewsByCourseId(course.id);
      }
      return courses;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllCoursesforPostings(){
    try{
      const snapshot = await this.collection.get();
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return courses;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // [UPDATED] Attach reviews for Instructor Dashboard
  async getCoursesByInstructor(instructorId) {
    try {
      const snapshot = await this.collection
        .where("instructorId", "==", instructorId)
        .get();
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const course of courses) {
        course.reviews = await reviewModel.getReviewsByCourseId(course.id);
      }
      return courses;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // New: Enroll a student
  async enrollStudent(courseId, studentId) {
    try {
      const courseRef = this.collection.doc(courseId);
      const doc = await courseRef.get();

      if (!doc.exists) throw new Error("Course not found");

      const currentEnrolled = doc.data().enrolledStudents || [];
      if (currentEnrolled.includes(studentId)) {
        throw new Error("Student already enrolled");
      }

      await courseRef.update({
        enrolledStudents: [...currentEnrolled, studentId],
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Error enrolling student: ${error.message}`);
    }
  }

  // UPDATED: Get specific course details (helper), also endsures reviews are attached
  async getCourseById(courseId) {
    try {
      const doc = await this.collection.doc(courseId).get();
      if (!doc.exists) return null;
      const data = doc.data();
      data.reviews = await reviewModel.getReviewsByCourseId(courseId); // Attach here too
      return { id: doc.id, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new CourseModel();
