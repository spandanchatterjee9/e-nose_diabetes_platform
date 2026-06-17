import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from app.models.base_model import BaseModel

class LogisticRegressionModel(BaseModel):
    def __init__(self, **kwargs):
        default_params = {
            "max_iter": 1000,
            "random_state": 42
        }
        default_params.update(kwargs)
        self.model = LogisticRegression(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "classes": [int(c) for c in self.model.classes_],
            "n_iter": int(self.model.n_iter_[0])
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
