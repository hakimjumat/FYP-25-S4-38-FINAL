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
            .map(key => parseFloat((resultsMap[key].score/resultsMap[key].answers.length)* 10));

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

    async getOverallStudentStats(req, res, next) {
        try{
            const { studentId, courseId} = req.body;
            const docId = `progress_${studentId}_${courseId}`;
            const doc = await db.collection("grades").doc(docId).get();
            
            if (!doc.exists) {
                return res.status(200).json({ 
                    success: false, 
                    message: "No course stats available yet.",
                    data: {}
                });
            }

            const resultsMap = doc.data().results || {};

            const allResults = Object.values(resultsMap)
                .map(item => parseFloat((item.score/item.answers.length) * 10))
                .filter(score => !isNaN(score));

            if (allResults.length === 0) {
                return res.status(200).json({ 
                    success: false, 
                    message: "No scores available to calculate stats",
                    data: {}
                });
            }

            const pythonResponse = await fetch("http://127.0.0.1:8000/overall-student-stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scores: allResults, student_id: studentId }),
            });

            const stats = await pythonResponse.json();

            // await db.collection("studentstats").doc(`stats_${courseId}`).set({
            //     ...stats,
            //     studentId: studentId,
            //     updated_at: new Date()
            // });

            res.status(200).json({ success: true, data: stats.results });
        } catch (error) {   
            console.error("Overall Student Stats Controller Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getInstructorCourseReport(req, res, next) {
        try {
            const { courseId, filterType } = req.body;
            console.log(`\n--- Analytics Debug: Course ${courseId} | Filter: ${filterType} ---`);

            const assessmentTypeCache = {}; 
            const studentsData = [];

            const studentsSnapshot = await db.collection("grades")
                .where("courseId", "==", courseId)
                .get();
            
            console.log(`1. Found ${studentsSnapshot.size} grade documents in Firestore.`);

            if (studentsSnapshot.empty) {
                return res.status(200).json({ success: false, message: "No student records found." });
            }

            await Promise.all(studentsSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const studentId = data.studentId;
                const resultsArray = Array.isArray(data.results) ? data.results : [];
                const filteredScores = [];

                console.log(`2. Processing Student: ${studentId} | Attempts: ${resultsArray.length}`);

                for (const result of resultsArray) {
                    const aId = result.assessmentId;
                    
                    if (!assessmentTypeCache[aId]) {
                        const assessDoc = await db.collection("assessments").doc(aId).get();
                        if (assessDoc.exists) {
                            assessmentTypeCache[aId] = assessDoc.data().type; 
                            console.log(`   - Assessment ${aId} detected as: "${assessmentTypeCache[aId]}"`);
                        } else {
                            console.log(`   - WARNING: Assessment ID ${aId} NOT FOUND in assessments collection.`);
                            assessmentTypeCache[aId] = "not_found";
                        }
                    }

                    if (assessmentTypeCache[aId] === filterType) {
                        //filteredScores.push(parseFloat((result.score/(result.answers.length * 10))* 100));
                        let y = result.answers.length;
                        if(y === 0)
                            y = 1;
                        let x = parseFloat((result.score/(y * 10))* 100);
                        filteredScores.push(parseFloat(x));
                        //filteredScores.push(parseFloat(result.score));
                    }
                }

                if (filteredScores.length > 0) {
                    // Fetch name logic
                    const userDoc = await db.collection("users").doc(studentId).get();
                    const studentName = userDoc.exists ? (userDoc.data().displayName || userDoc.data().firstName || "Student") : "Unknown";
                    
                    studentsData.push({
                        studentId,
                        studentName,
                        averageScore: filteredScores.reduce((a, b) => a + b, 0) / filteredScores.length,
                        trend: filteredScores.length > 1 ? filteredScores[filteredScores.length - 1] - filteredScores[0] : 0
                    });
                }
            }));

            console.log(`3. Final Results Found: ${studentsData.length}`);

            if (studentsData.length === 0) {
                return res.status(200).json({ 
                    success: false, 
                    message: `No ${filterType} data found. Check your Node console for ID mismatch logs.` 
                });
            }

            const pythonResponse = await fetch("http://127.0.0.1:8000/instructor-course-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ students: studentsData, threshold: 50.0 }),
            });
            
            const report = await pythonResponse.json();
            const flattenedData = {
            overall_average: report.report.overall_average_score,
            at_risk_count: report.report.students_at_risk,
            student_list: report.weaker_students 
        };

        
            res.status(200).json({ success: true, data: flattenedData });

        } catch (error) {
            console.error("Instructor Report Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Add this method to your AnalyticsController class
   async getGroupedAssessmentReport(req, res) {
        try {
            const { courseId, filterType } = req.body;
            console.log(`\n--- Breakdown Debug: Course ${courseId} | Filter: ${filterType} ---`);

            const assessmentCache = {}; 
            const groupedData = {}; // Format: { assessmentId: { title, students: [] } }

            const studentsSnapshot = await db.collection("grades")
                .where("courseId", "==", courseId)
                .get();
            
            console.log(`1. Found ${studentsSnapshot.size} grade documents.`);

            if (studentsSnapshot.empty) {
                return res.status(200).json({ success: true, data: [] });
            }

            // Process students one by one or in a controlled map to ensure groupedData is populated safely
            for (const doc of studentsSnapshot.docs) {
                const data = doc.data();
                const studentId = data.studentId;
                const resultsArray = Array.isArray(data.results) ? data.results : [];

                // Fetch Student Name
                const userDoc = await db.collection("users").doc(studentId).get();
                const displayName = userDoc.exists 
                    ? (userDoc.data().displayName || `${userDoc.data().firstName} ${userDoc.data().lastName}`) 
                    : "Unknown Student";

                for (const result of resultsArray) {
                    const aId = result.assessmentId;

                    // Lookup Assessment metadata if not in cache
                    if (!assessmentCache[aId]) {
                        const assessDoc = await db.collection("assessments").doc(aId).get();
                        if (assessDoc.exists) {
                            assessmentCache[aId] = assessDoc.data();
                        } else {
                            assessmentCache[aId] = { type: "not_found", title: "Deleted Assessment" };
                        }
                    }

                    // Match against filterType (case-insensitive)
                    const currentType = assessmentCache[aId].type || "";
                    if (currentType.toLowerCase() === filterType.toLowerCase()) {
                        if (!groupedData[aId]) {
                            groupedData[aId] = { 
                                title: assessmentCache[aId].title || "Untitled Assessment", 
                                students: [] 
                            };
                        }
                        
                        groupedData[aId].students.push({
                            name: displayName,
                            score: parseFloat(result.score) || 0
                        });
                    }
                }
            }

            // Transform grouped object into an array and calculate averages
            const finalData = Object.values(groupedData).map(group => {
                const total = group.students.reduce((acc, s) => acc + s.score, 0);
                return {
                    title: group.title,
                    avgScore: group.students.length > 0 ? (total / group.students.length).toFixed(1) : 0,
                    students: group.students.sort((a, b) => b.score - a.score) 
                };
            });

            console.log(`2. Successfully grouped into ${finalData.length} assessment blocks.`);
            res.status(200).json({ success: true, data: finalData });

        } catch (error) {
            console.error("Grouped Report Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new AnalyticsController();
