// to handle course related crud database operations e.g create, read, update, delete
const db = require("../config/db");

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

  async getCoursesByInstructor(instructorId) {
    try {
      const snapshot = await this.collection
        .where("instructorId", "==", instructorId)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error fetching courses: ${error.message}`);
    }
  }

  // new methods 121225
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
      // in real app, we should also delete from firestore directly to save space, for now we just delete the record
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

  // New: Get all courses for the Student Course Page
  async getAllCourses() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error fetching all courses: ${error.message}`);
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

  // New: Get specific course details (helper)
  async getCourseById(courseId) {
    try {
      const doc = await this.collection.doc(courseId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching course: ${error.message}`);
    }
  }
}

module.exports = new CourseModel();
