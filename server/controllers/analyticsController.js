const db = require("../config/db");

class AnalyticsController {
    async getStudentRiskAnalysis(req, res, next) {
        try {
            const { studentId, courseId, assessmentId, type } = req.body;
            const docId = `progress_${studentId}_${courseId}`;
            const doc = await db.collection("grades").doc(docId).get();

            // If no record, return a 200 with an empty state instead of a 404 
            // This prevents the frontend "Response not ok" error
            if (!doc.exists) {
            return res.status(200).json({ 
                success: false, 
                message: "No data available yet.",
                data: { riskLevel: "N/A", scoreAvg: 0, trendValue: 0, recommendation: "Complete an assessment to see analysis." }
            });
            }

            const resultsMap = doc.data().results || {};

            // FIXED SORTING: Get keys, sort them numerically, then map to scores
            const scores = Object.keys(resultsMap)
            .filter(key => resultsMap[key].assessmentId === assessmentId)
            .sort((a, b) => parseInt(a) - parseInt(b)) // Sorts "0", "1", "2" correctly
            .map(key => parseFloat(resultsMap[key].score));

            if (scores.length === 0) {
            return res.status(200).json({ 
                success: false, 
                message: "No attempts found for this quiz.",
                data: { riskLevel: "N/A", scoreAvg: 0, trendValue: 0 }
            });
            }

            const pythonResponse = await fetch("http://127.0.0.1:8000/predict-risk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scores, attendance: 85.0, type: type }),
            });

            const prediction = await pythonResponse.json();
            res.status(200).json({ success: true, data:{ ...prediction, history: scores } });

        } catch (error) {
            console.error("Analysis Controller Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new AnalyticsController();
