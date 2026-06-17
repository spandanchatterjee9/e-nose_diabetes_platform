from app.models.base_model import BaseModel
from app.models.rf_model import RandomForestModel
from app.models.lr_model import LogisticRegressionModel
from app.models.xgb_model import XGBoostModel
from app.models.svm_model import SVMModel
from app.models.knn_model import KNNModel

# Register all model classes here.
# To integrate a new model, implement the BaseModel interface and add it to this registry.
# This satisfies the requirement that changing the active model requires modifying ONLY one file.
MODEL_REGISTRY = {
    "random_forest": RandomForestModel,
    "logistic_regression": LogisticRegressionModel,
    "xgboost": XGBoostModel,
    "svm": SVMModel,
    "knn": KNNModel
}

DEFAULT_MODEL_NAME = "random_forest"

def get_model(model_name: str = DEFAULT_MODEL_NAME, **kwargs) -> BaseModel:
    """Factory function to retrieve model instance by registered name."""
    if model_name not in MODEL_REGISTRY:
        raise ValueError(
            f"Model '{model_name}' is not registered. "
            f"Available models: {list(MODEL_REGISTRY.keys())}"
        )
    return MODEL_REGISTRY[model_name](**kwargs)
