const db = require("../config/db");

class GradeModel {
  constructor() {
    this.collection = db.collection("grades");
  }

  async createCourseGrade(studentId, courseId){
    try{
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
      
      const citiesRef = db.collection('grades');
      
      const snapshot = await citiesRef.where('studentId', '==', studentId).where('courseId', '==', courseId).get();
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }  

      let xx;

      snapshot.forEach(doc => {
        //there should only be one
        console.log(doc.id, '=>', doc.data());
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
      } 
      else {
        const data = doc.data();
        const gradesArray = data.results || [];
        gradesArray.push(datatobesent);
        await docRef.update({results: gradesArray});
      }
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
module.exports = new GradeModel();
