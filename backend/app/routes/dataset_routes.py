from fastapi import APIRouter
from app.controllers.dataset_controller import DatasetController
from app.models.schemas import DatasetStatsResponse

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

@router.get("/stats", response_model=DatasetStatsResponse)
def get_stats():
    """Retrieves dataset summary, features distribution, and correlation metrics."""
    return DatasetController.get_stats()
