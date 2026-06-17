from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictRequest(BaseModel):
    TGS2600: float = Field(..., description="Sensor TGS 2600 reading", example=23.65)
    TGS2602: float = Field(..., description="Sensor TGS 2602 reading", example=58.33)
    TGS2610: float = Field(..., description="Sensor TGS 2610 reading", example=15.02)
    TGS2611: float = Field(..., description="Sensor TGS 2611 reading", example=10.16)
    TGS2620: float = Field(..., description="Sensor TGS 2620 reading", example=24.50)
    TGS826: float = Field(..., description="Sensor TGS 826 reading", example=30.04)

class PatientInfo(BaseModel):
    patient_id: str = Field(..., description="Unique patient identifier", example="PT-2026-9812")
    name: str = Field(..., description="Patient full name", example="Alexander Smith")
    age: int = Field(..., description="Patient age in years", example=48)
    gender: str = Field(..., description="Gender: Male/Female/Other", example="Male")
    height: float = Field(..., description="Height in meters", example=1.78)
    weight: float = Field(..., description="Weight in kilograms", example=82.5)

class PatientAssessmentRequest(BaseModel):
    patient_info: PatientInfo
    sensor_data: PredictRequest

class TrainRequest(BaseModel):
    model_name: str = Field(default="random_forest", description="Model name to train (random_forest, logistic_regression, xgboost, svm, knn)")
    run_tuning: bool = Field(default=True, description="Whether to run Optuna hyperparameter optimization")
    n_trials: int = Field(default=15, description="Number of Optuna trials to execute if tuning is active")

class Contribution(BaseModel):
    feature: str
    raw_value: float
    shap_value: float
    direction: str

class PredictionResponse(BaseModel):
    prediction: str
    class_index: int
    confidence: float
    expected_value: float
    contributions: List[Contribution]
    waterfall_plot: str

class AssessmentResponse(BaseModel):
    assessment_id: str
    patient_info: PatientInfo
    bmi: float
    sensor_data: PredictRequest
    prediction: str
    confidence: float
    risk_percentage: float
    risk_category: str
    clinical_recommendation: str
    timestamp: str
    model_version: str

class DatasetStatsResponse(BaseModel):
    total_samples: int
    class_distribution: List[Dict[str, Any]]
    feature_stats: List[Dict[str, Any]]
    correlation_matrix: List[List[float]]
    features: List[str]

class ExperimentRunResponse(BaseModel):
    run_id: str
    status: str
    start_time: str
    parameters: Dict[str, Any]
    metrics: Dict[str, float]
