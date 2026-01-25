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

@app.post("/predict-risk")
async def predict_risk(data: RiskRequest):
    # Data Mining: Calculate Average and Improvement Trend
    avg_score = sum(data.scores) / len(data.scores)
    
    # Trend = Difference between last attempt and first attempt
    trend = data.scores[-1] - data.scores[0] if len(data.scores) > 1 else 0

    # Risk Classification Logic
    if avg_score < 50 or trend < -15:
        risk_level = "High"
        advice = "Critical: Student performance is dropping significantly."
    elif avg_score < 70 or trend < 0:
        risk_level = "Medium"
        advice = "Warning: Student is stagnant or showing slight regression."
    else:
        risk_level = "Low"
        advice = "Good: Student is showing consistent mastery."

    return {
        "riskLevel": risk_level,
        "scoreAvg": round(avg_score, 2),
        "trendValue": round(trend, 2),
        "recommendation": advice
    }