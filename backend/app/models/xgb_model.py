import pickle
import numpy as np
from xgboost import XGBClassifier
from app.models.base_model import BaseModel

class XGBoostModel(BaseModel):
    def __init__(self, **kwargs):
        default_params = {
            "n_estimators": 100,
            "random_state": 42,
            "eval_metric": "logloss",
            "n_jobs": -1
        }
        default_params.update(kwargs)
        self.model = XGBClassifier(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "n_estimators": int(self.model.n_estimators),
            "classes": [int(c) for c in self.model.classes_]
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

    def save(self, path: str) -> None:
        with open(path, 'wb') as f:
            pickle.dump(self.model, f)

    def load(self, path: str) -> None:
        with open(path, 'rb') as f:
            self.model = pickle.load(f)
