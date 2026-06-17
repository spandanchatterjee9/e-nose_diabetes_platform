import os
import uuid
import sqlite3
import json
import pickle
import numpy as np
from datetime import datetime
from app.models.schemas import PatientAssessmentRequest
from app.services.explain_service import ExplainService
from app.models.model_factory import get_model

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
# Store DB inside mlflow folder to persist correctly on WSL volume mapping
DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "mlflow", "assessments.db")

class AssessmentService:
    @staticmethod
    def init_db():
        """Initializes the SQLite database schema for patient assessments."""
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                assessment_id TEXT PRIMARY KEY,
                patient_id TEXT,
                name TEXT,
                age INTEGER,
                gender TEXT,
                height REAL,
                weight REAL,
                bmi REAL,
                sensor_data TEXT,
                prediction TEXT,
                confidence REAL,
                risk_percentage REAL,
                risk_category TEXT,
                clinical_recommendation TEXT,
                timestamp TEXT,
                model_version TEXT
            )
        """)
        conn.commit()
        conn.close()

    @staticmethod
    def save_assessment(assessment_data: dict):
        """Saves a single patient assessment record to the database."""
        AssessmentService.init_db()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        pi = assessment_data["patient_info"]
        sd = assessment_data["sensor_data"]
        
        cursor.execute("""
            INSERT INTO assessments (
                assessment_id, patient_id, name, age, gender, height, weight, bmi,
                sensor_data, prediction, confidence, risk_percentage, risk_category,
                clinical_recommendation, timestamp, model_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assessment_data["assessment_id"],
            pi["patient_id"],
            pi["name"],
            pi["age"],
            pi["gender"],
            pi["height"],
            pi["weight"],
            assessment_data["bmi"],
            json.dumps(sd),
            assessment_data["prediction"],
            assessment_data["confidence"],
            assessment_data["risk_percentage"],
            assessment_data["risk_category"],
            assessment_data["clinical_recommendation"],
            assessment_data["timestamp"],
            assessment_data["model_version"]
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_assessment(assessment_id: str) -> dict:
        """Retrieves a single patient assessment record by ID."""
        AssessmentService.init_db()
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE assessment_id = ?", (assessment_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
            
        data = dict(row)
        # Re-construct nested structures
        return {
            "assessment_id": data["assessment_id"],
            "patient_info": {
                "patient_id": data["patient_id"],
                "name": data["name"],
                "age": data["age"],
                "gender": data["gender"],
                "height": data["height"],
                "weight": data["weight"]
            },
            "bmi": data["bmi"],
            "sensor_data": json.loads(data["sensor_data"]),
            "prediction": data["prediction"],
            "confidence": data["confidence"],
            "risk_percentage": data["risk_percentage"],
            "risk_category": data["risk_category"],
            "clinical_recommendation": data["clinical_recommendation"],
            "timestamp": data["timestamp"],
            "model_version": data["model_version"]
        }

    @staticmethod
    def get_all_assessments(limit: int = 10) -> list:
        """Retrieves historical patient assessment listings."""
        AssessmentService.init_db()
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        
        assessments_list = []
        for row in rows:
            data = dict(row)
            assessments_list.append({
                "assessment_id": data["assessment_id"],
                "patient_info": {
                    "patient_id": data["patient_id"],
                    "name": data["name"],
                    "age": data["age"],
                    "gender": data["gender"],
                    "height": data["height"],
                    "weight": data["weight"]
                },
                "bmi": data["bmi"],
                "sensor_data": json.loads(data["sensor_data"]),
                "prediction": data["prediction"],
                "confidence": data["confidence"],
                "risk_percentage": data["risk_percentage"],
                "risk_category": data["risk_category"],
                "clinical_recommendation": data["clinical_recommendation"],
                "timestamp": data["timestamp"],
                "model_version": data["model_version"]
            })
        return assessments_list

    @staticmethod
    def evaluate_assessment(payload: PatientAssessmentRequest) -> dict:
        """Runs patient assessment logic, calculates BMI and clinical recommendations."""
        # Check files exist
        model_path = os.path.join(ARTIFACTS_DIR, "model.pkl")
        scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.pkl")
        
        if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
            raise FileNotFoundError("Model or Scaler not found. Run training pipeline first.")
            
        # Load pkls
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
            
        with open(model_path, "rb") as f:
            model = pickle.load(f)
            
        # Calculate BMI
        height = payload.patient_info.height
        weight = payload.patient_info.weight
        bmi = weight / (height ** 2) if height > 0 else 0
        
        # Format features and predict
        features = payload.sensor_data.model_dump()
        raw_values = np.array([[features[col] for col in ["TGS2600", "TGS2602", "TGS2610", "TGS2611", "TGS2620", "TGS826"]]])
        scaled_values = scaler.transform(raw_values)
        
        pred_class_idx = int(model.predict(scaled_values)[0])
        pred_probs = model.predict_proba(scaled_values)[0]
        
        # Diabetes class index is 1
        diabetes_prob = float(pred_probs[1])
        prediction = "Diabetes" if pred_class_idx == 1 else "Normal"
        confidence = float(pred_probs[pred_class_idx])
        
        # Risk score mapped to diabetes probability percent
        risk_pct = diabetes_prob * 100
        
        # Risk Category classification
        if pred_class_idx == 0:
            risk_category = "Low"
            clinical_recommendation = (
                "Maintain healthy lifestyle and balanced diet. Schedule standard annual health checks. "
                "No indications of diabetic breath signatures detected."
            )
        else:
            if risk_pct > 80:
                risk_category = "High"
                clinical_recommendation = (
                    "Highly recommended to undergo a clinical Fasting Blood Sugar (FBS) test and HbA1c screening. "
                    "Consult an endocrinologist immediately. Strong traces of glycemic markers detected in breath."
                )
            else:
                risk_category = "Moderate"
                clinical_recommendation = (
                    "Recommend schedule standard oral glucose screening and HbA1c checks. "
                    "Review carbohydrate intakes and engage in regular physical activity. Traces of metabolic biomarkers present."
                )
                
        # Get active model version / type name
        model_version = f"{model.__class__.__name__} Classifier (v1.0)"
        
        assessment_id = f"AST-{uuid.uuid4().hex[:8].upper()}"
        
        assessment_data = {
            "assessment_id": assessment_id,
            "patient_info": payload.patient_info.model_dump(),
            "bmi": float(bmi),
            "sensor_data": features,
            "prediction": prediction,
            "confidence": confidence,
            "risk_percentage": risk_pct,
            "risk_category": risk_category,
            "clinical_recommendation": clinical_recommendation,
            "timestamp": datetime.now().isoformat(),
            "model_version": model_version
        }
        
        # Save to database
        AssessmentService.save_assessment(assessment_data)
        
        return assessment_data
