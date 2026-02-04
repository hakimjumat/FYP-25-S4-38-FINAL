import firebase_admin 
from firebase_admin import credentials, firestore
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, "*" allows any frontend to connect
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, etc.
    allow_headers=["*"], # Allows any headers
)

class RiskRequest(BaseModel):
    scores: List[float]
    attendance: Optional[float] = 100.0
    type: Optional[str] = "quiz"

class StatsRequest(BaseModel):
    scores: List[float]
    student_id: Optional[str] = "unknown"

class StudentPerformance(BaseModel):
    studentId: str
    studentName: str
    averageScore: float
    trend: Optional[float] = 0.0

class InstructorStatsRequest(BaseModel):
    students: List[StudentPerformance]
    threshold: Optional[float] = 50.0

@app.post("/predict-risk")
async def predict_risk(data: RiskRequest):
    # 1. Handle Empty Data
    if not data.scores or len(data.scores) == 0:
        return {
            "riskLevel": "Inconclusive",
            "scoreAvg": 0,
            "trendValue": 0,
            "recommendation": "No performance data detected yet.",
            "history": []
        }

    avg_score = sum(data.scores) / len(data.scores)
    # Always calculate trend for the return object
    trend = data.scores[-1] - data.scores[0] if len(data.scores) > 1 else 0
    
    is_weighted = data.type in ["test", "weighted"]

    # 2. Case: Weighted Test Logic
    if is_weighted:
        if avg_score < 50:
            risk_level, advice = "High", "Critical: This weighted test score is below passing. Please schedule a consultation."
        elif avg_score < 75:
            risk_level, advice = "Medium", "Fair performance on this weighted test. Focus on weaker topics for the final."
        else:
            risk_level, advice = "Low", "Great job! This weighted score significantly boosts your overall grade."

    # 3. Case: Single Attempt Quiz
    elif len(data.scores) == 1:
        score = data.scores[0]
        if score < 50:
            risk_level, advice = "High", "First attempt is low. Review materials before trying again."
        elif score < 75:
            risk_level, advice = "Medium", "Good start, but there is room for improvement."
        else:
            risk_level, advice = "Low", "Excellent first attempt! Keep up the high standard."

    # 4. Case: Multiple Attempt Quiz (Trend Analysis)
    else:
        if avg_score < 50:
            risk_level = "High"
            advice = "Low average, but showing improvement." if trend > 10 else "Critical: Consistently low performance."
        elif trend < -15:
            risk_level = "High"
            advice = "Critical: Sharp decline in recent performance."
        elif avg_score < 75:
            risk_level = "Medium"
            advice = "Average performance; needs consistent practice."
        else:
            risk_level = "Low"
            advice = "Excellent: Showing mastery of material."

    return {
        "riskLevel": risk_level,
        "scoreAvg": round(avg_score, 2),
        "trendValue": round(trend, 2),
        "recommendation": advice,
        "history": data.scores
    }

@app.post("/overall-student-stats")
def get_overall_stats(data: StatsRequest):
    if not data.scores:
        return {
            "success": False,
            "message": "No scores available to calculate stats",
            "results": {}
        }
    
    p25, p75 = np.percentile(data.scores, [25, 75])
    avg_score = sum(data.scores) / len(data.scores)

    stats_results = {
        "lowest_score": min(data.scores),
        "highest_score": max(data.scores),
        "avg_score": round(avg_score, 2),
        "p25_score": round(p25, 2),
        "p75_score": round(p75, 2)
    }

    return_results = {
        "success": True,
        "message": "Statistics calculated successfully",
        "results": stats_results
    }

    return return_results

@app.post("/instructor-course-report")
def get_instructor_course_report(data: InstructorStatsRequest):
    if not data.students:
        return {"success": False, "message": "No data", "report": {}}
    
    total_students = len(data.students)
    avg_scores = [s.averageScore for s in data.students]
    overall_avg = sum(avg_scores) / total_students
    
    bottom_quartile = np.percentile(avg_scores, 25) if total_students > 0 else 0

    student_summaries = []
    at_risk_count = 0

    for student in data.students:
        # Define "Critical" as failing score OR a sharp downward trend
        is_critical = student.averageScore < data.threshold or student.trend < -15
        
        if is_critical:
            at_risk_count += 1
            
        student_summaries.append({
            "id": student.studentId,
            "name": student.studentName,
            "score": round(student.averageScore, 2),
            "trend": round(student.trend, 2),
            # 'Critical' students get the priority label, others are 'Normal'
            "priority": "Critical" if is_critical else "Normal" 
        })

    # Sort so the struggling/critical students appear at the top
    student_summaries.sort(key=lambda x: (x["priority"] != "Critical", x["score"]))

    return {
        "success": True,
        "report": {
            "total_students": total_students,
            "overall_average_score": round(overall_avg, 2),
            "students_at_risk": at_risk_count, # Corrected count
            "bottom_quartile_score": round(bottom_quartile, 2)
        },
        "weaker_students": student_summaries # Now contains the whole class
    }