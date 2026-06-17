from fastapi import APIRouter
from typing import List
from app.controllers.model_controller import ModelController
from app.models.schemas import TrainRequest, ExperimentRunResponse

router = APIRouter(prefix="/api/model", tags=["Model Pipeline"])

@router.post("/train")
def train_model(payload: TrainRequest = TrainRequest()):
    """Triggers ML training pipeline with optional Optuna hyperparameter tuning."""
    return ModelController.train_model(payload)

@router.get("/experiments", response_model=List[ExperimentRunResponse])
def get_experiments():
    """Fetches MLflow tracking runs list including parameters and metrics."""
    return ModelController.get_experiments()
