import pickle
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from app.models.base_model import BaseModel

class KNNModel(BaseModel):
    def __init__(self, **kwargs):
        default_params = {
            "n_neighbors": 5
        }
        default_params.update(kwargs)
        self.model = KNeighborsClassifier(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "classes": [int(c) for c in self.model.classes_],
            "n_neighbors": int(self.model.n_neighbors)
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
