from abc import ABC, abstractmethod
import numpy as np

class BaseModel(ABC):
    @abstractmethod
    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        """
        Train the model with X_train and y_train.
        Returns a dict containing training information/metrics.
        """
        pass

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict labels for input features X.
        """
        pass

    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Predict class probabilities for input features X.
        """
        pass

    @abstractmethod
    def save(self, path: str) -> None:
        """
        Save the model state to disk.
        """
        pass

    @abstractmethod
    def load(self, path: str) -> None:
        """
        Load the model state from disk.
        """
        pass
