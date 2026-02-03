# import firebase_admin 
# from firebase_admin import credentials, firestore
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# # Initialize Firebase Admin SDK
# cred = credentials.Certificate("serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

# db = firestore.client()

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
    type: Optional[str] = "quiz" # Changed from assessment_type to type

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