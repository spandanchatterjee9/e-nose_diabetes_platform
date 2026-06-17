import os
import pickle
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from app.services.explain_service import ExplainService
from app.services.assessment_service import AssessmentService
from app.services.pdf_service import PDFService
from app.models.schemas import PredictRequest, PatientAssessmentRequest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

class AssessmentController:
    @staticmethod
    def predict_raw(payload: PredictRequest):
        try:
            model_path = os.path.join(ARTIFACTS_DIR, "model.pkl")
            scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.pkl")
            
            if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
                raise FileNotFoundError("Model or Scaler files not found. Train model first.")
                
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)
                
            features = payload.model_dump()
            explanation = ExplainService.explain_prediction(features, model, scaler)
            return explanation
        except FileNotFoundError as fnf:
            raise HTTPException(status_code=400, detail=str(fnf))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def create_assessment(payload: PatientAssessmentRequest):
        try:
            assessment = AssessmentService.evaluate_assessment(payload)
            return assessment
        except FileNotFoundError as fnf:
            raise HTTPException(status_code=400, detail=str(fnf))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_latest_assessments(limit: int = 10):
        try:
            return AssessmentService.get_all_assessments(limit=limit)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def download_report(assessment_id: str):
        try:
            assessment = AssessmentService.get_assessment(assessment_id)
            if not assessment:
                raise HTTPException(status_code=404, detail="Assessment record not found.")
                
            pdf_buffer = PDFService.generate_patient_report(assessment)
            
            return StreamingResponse(
                pdf_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=patient_report_{assessment_id}.pdf"}
            )
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
