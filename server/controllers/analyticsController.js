const analyticsModel = require('../models/analyticsModel');
const db = require("../config/db");

class AnalyticsController {
    async getStudentRiskAnalysis(req, res, next) {
        try {
            const { studentId, courseId, assessmentId } = req.body;

            // 1. DIRECT FETCH using the specific Doc ID format
            // Format: progress_HCU7..._4qV8...
            const docId = `progress_${studentId}_${courseId}`;
            const docRef = db.collection('grades').doc(docId);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({ message: "No progress record found for this student in this course" });
            }

            const data = doc.data();
            const resultsMap = data.results || {};

            // 2. EXTRACT & SORT SCORES
            // We filter by assessmentId because one 'progress' doc contains multiple different quizzes
            const scores = Object.keys(resultsMap)
                .map(key => resultsMap[key])
                .filter(attempt => attempt.assessmentId === assessmentId)
                .sort((a, b) => parseInt(a) - parseInt(b)) // Sort by attempt number (0, 1, 2...)
                .map(attempt => parseFloat(attempt.score));

            if (scores.length === 0) {
                return res.status(404).json({ message: "No attempts found for this specific assessment" });
            }

            // 3. CALL PYTHON AI SERVICE
            const pythonResponse = await fetch("http://127.0.0.1:8000/predict-risk", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scores: scores,
                    attendance: 85.0 
                })
            });

            const prediction = await pythonResponse.json();
            res.status(200).json({ success: true, data: prediction });

        } catch (error) {
            console.error("Fetch Error:", error);
            next(error);
        }
    }

}

module.exports = new AnalyticsController();