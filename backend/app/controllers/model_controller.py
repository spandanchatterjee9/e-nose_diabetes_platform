from fastapi import HTTPException
from app.services.ml_service import MLService
from app.models.schemas import TrainRequest

class ModelController:
    @staticmethod
    def train_model(payload: TrainRequest):
        try:
            results = MLService.train_and_log_model(
                model_name=payload.model_name,
                run_tuning=payload.run_tuning,
                n_trials=payload.n_trials
            )
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_experiments():
        try:
            return MLService.get_mlflow_runs()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
