from fastapi import HTTPException
from app.services.ml_service import MLService

class DatasetController:
    @staticmethod
    def get_stats():
        try:
            return MLService.get_dataset_stats()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
