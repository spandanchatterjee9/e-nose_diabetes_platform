import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from app.models.base_model import BaseModel

class RandomForestModel(BaseModel):
    def __init__(self, **kwargs):
        # Default baseline parameters if not specified
        default_params = {
            "n_estimators": 100,
            "random_state": 42,
            "n_jobs": -1
        }
        default_params.update(kwargs)
        self.model = RandomForestClassifier(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "n_estimators": int(self.model.n_estimators),
            "max_depth": int(self.model.max_depth) if self.model.max_depth is not None else None,
            "min_samples_split": int(self.model.min_samples_split),
            "min_samples_leaf": int(self.model.min_samples_leaf),
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
