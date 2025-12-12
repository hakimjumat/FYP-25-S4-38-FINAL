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

  async addContent(courseId, contentItem) {
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
}

module.exports = new CourseModel();
