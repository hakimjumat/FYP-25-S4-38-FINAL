const db = require("../config/db");

class GradeModel {
  constructor() {
    this.collection = db.collection("grades");
  }

  async createCourseGrade(studentId, courseId) {
    try {
      //CourseGrade
      //{
      //  CourseGradeid
      //  studentId
      //  CourseId
      //  results: []
      //}
      await this.collection.add({
        studentId,
        courseId,
        results: [],
      });
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getGradeByCourseId(courseId){
    try{
      const snapshot = await this.collection.where("courseId", "==", courseId).get();

      if (snapshot.empty) {
          console.log("No matching documents.");
          return;
      }

      snapshot.docs.forEach((doc) => {
          //there should only be one
          console.log(doc.id, "=>", doc.data());
          //xx = doc.id;
      });

      return snapshot.docs.map((doc) => ({ id: doc.data().studentId, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllGradesTagToSID()
  {
    //get all grades and map to student id
    try{
      const snapshot = await this.collection.get();

      if (snapshot.empty) {
          console.log("No matching documents.");
          return;
      }

      snapshot.forEach((doc) => {
          //there should only be one
          console.log(doc.id, "=>", doc.data());
          //xx = doc.id;
      });

      return snapshot.docs.map((doc) => ({ id: doc.data().studentId, ...doc.data() }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async submitTestAttempt(studentId, courseId, assessmentId, datatobesent) {
    try {
      // RESULT DATA STRUCTURE
      // {
      //   score: 85,
      //   timeTaken: 450, (seconds) <--- For 'Speed vs Grade' insight
      //   answers: [
      //     { qId: "q1", isCorrect: true, timeSpent: 30 }, // <--- Deep Dive Analytics
      //     { qId: "q2", isCorrect: false, selected: "B" }
      //   ]
      // }
      //await this.collection.add({
      //  studentId,
      //  assessmentId,
      //  ...resultData,
      //  submittedAt: new Date().toISOString(),
      //});

      const citiesRef = db.collection("grades");

      const snapshot = await citiesRef
        .where("studentId", "==", studentId)
        .where("courseId", "==", courseId)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }

      let xx;

      snapshot.forEach((doc) => {
        //there should only be one
        console.log(doc.id, "=>", doc.data());
        xx = doc.id;
      });
      const z = xx;
      console.log(z);

      const docRef = this.collection.doc(z);
      const doc = await docRef.get();
      console.log(doc);

      //console.log(studentId);
      //console.log(courseId);
      //console.log(assessmentId);
      //console.log(datatobesent);

      if (!doc.exists) {
        throw new Error("User profile not found");
      } else {
        const data = doc.data();
        const gradesArray = data.results || [];
        gradesArray.push(datatobesent);
        await docRef.update({ results: gradesArray });
      }
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // [NEW] Mark Content as Viewed by Student
  async markItemViewed(studentId, courseId, contentId) {
    try {
      // Create a specific ID so we can find this exact record easily
      // Format: "progress_STUDENT-ID_COURSE-ID"
      const docId = `progress_${studentId}_${courseId}`;
      const docRef = this.collection.doc(docId);
      const doc = await docRef.get();

      let viewedItems = [];
      if (doc.exists) {
        viewedItems = doc.data().viewedItems || [];
      }

      // Add item if not already in the list
      if (!viewedItems.includes(contentId)) {
        viewedItems.push(contentId);

        // Save to the 'grades' collection
        await docRef.set(
          {
            type: "progress", // Tag it
            studentId,
            courseId,
            viewedItems,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      return viewedItems;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // [NEW] Get Progress (Fetched from 'grades' collection)
  async getProgress(studentId, courseId) {
    try {
      const docId = `progress_${studentId}_${courseId}`;
      const doc = await this.collection.doc(docId).get();

      if (!doc.exists) return [];
      return doc.data().viewedItems || [];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getSingleStudentGrade(studentId, courseId) {
    try {
      const docId = `progress_${studentId}_${courseId}`;
      const doc = await this.collection.doc(docId).get();

      if (!doc.exists){
        //error
      }
      return doc.data();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async UpdateSingleStudentGrade(studentId, courseId, newTG) {
    try {
      const docId = `progress_${studentId}_${courseId}`;
      const doc = await this.collection.doc(docId).get();

      await this.collection.doc(docId).update({total_Grade: newTG});

      if (!doc.exists){
        //error
      }
      
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
module.exports = new GradeModel();
