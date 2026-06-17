from fastapi import APIRouter, Query
from typing import List
from app.controllers.assessment_controller import AssessmentController
from app.models.schemas import PredictRequest, PatientAssessmentRequest, PredictionResponse, AssessmentResponse

router = APIRouter(tags=["Clinical Assessment"])

@router.post("/api/predict", response_model=PredictionResponse)
def predict_raw(payload: PredictRequest):
    """Diagnoses diabetes and computes local SHAP explainability for raw sensor data."""
    return AssessmentController.predict_raw(payload)

@router.post("/api/assessment", response_model=AssessmentResponse)
def create_assessment(payload: PatientAssessmentRequest):
    """Processes full patient assessments, determines risk and clinical recommendations."""
    return AssessmentController.create_assessment(payload)

@router.get("/api/assessments", response_model=List[AssessmentResponse])
def get_assessments(limit: int = Query(default=10, description="Max records to return")):
    """Fetches historical patient diagnostic assessment listings."""
    return AssessmentController.get_latest_assessments(limit)

@router.get("/api/assessment/report/{assessment_id}")
def download_report(assessment_id: str):
    """Generates and downloads a custom patient clinical report PDF."""
    return AssessmentController.download_report(assessment_id)
