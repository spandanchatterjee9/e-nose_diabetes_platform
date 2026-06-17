import pickle
import numpy as np
from sklearn.svm import SVC
from app.models.base_model import BaseModel

class SVMModel(BaseModel):
    def __init__(self, **kwargs):
        default_params = {
            "probability": True,
            "random_state": 42
        }
        default_params.update(kwargs)
        self.model = SVC(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "classes": [int(c) for c in self.model.classes_],
            "n_support": [int(n) for n in self.model.n_support_]
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
