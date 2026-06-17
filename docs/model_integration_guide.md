# Future Model Integration Guide - E-Nose Diabetes Detection

This guide walks through the simple process of adding a new machine learning or deep learning classifier to the E-Nose research platform. The codebase has been fully modularized with a strict `BaseModel` abstraction layer and a centralized factory pattern, ensuring that integrating a new model requires modification in **only one file**.

---

## Step 1: Implement the `BaseModel` Interface

Create a new file in `/backend/app/models/` (e.g., `xgb_model.py`) and implement a class that inherits from `BaseModel`.

```python
import pickle
import numpy as np
from xgboost import XGBClassifier
from app.models.base_model import BaseModel

class XGBoostModel(BaseModel):
    def __init__(self, **kwargs):
        default_params = {
            "n_estimators": 100,
            "max_depth": 6,
            "learning_rate": 0.1,
            "random_state": 42,
            "use_label_encoder": False,
            "eval_metric": "logloss"
        }
        default_params.update(kwargs)
        self.model = XGBClassifier(**default_params)

    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> dict:
        self.model.fit(X_train, y_train)
        return {
            "n_estimators": int(self.model.n_estimators),
            "max_depth": int(self.model.max_depth),
            "learning_rate": float(self.model.learning_rate)
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
```

---

## Step 2: Register the Model in the Factory

Open [model_factory.py](file:///c:/Users/spand/college/research_ml_E-nose/diabetes/Diabetes_frontend_ui/backend/app/models/model_factory.py). This is the **only file** you need to modify to integrate the model.

1. Import your new model class.
2. Register it inside the `MODEL_REGISTRY` mapping.
3. (Optional) Update `DEFAULT_MODEL_NAME` to make your new model the baseline.

```diff
  from app.models.base_model import BaseModel
  from app.models.rf_model import RandomForestModel
+ from app.models.xgb_model import XGBoostModel

  MODEL_REGISTRY = {
      "random_forest": RandomForestModel,
-     # "xgboost": XGBoostModel,
+     "xgboost": XGBoostModel,
  }

- DEFAULT_MODEL_NAME = "random_forest"
+ DEFAULT_MODEL_NAME = "xgboost"
```

---

## Step 3: Verify Integration

Once registered, the entire pipeline immediately adapts:
- **Tuning (Optuna)**: To optimize the new model's specific hyperparameters, adjust `objective(trial)` inside [ml_service.py](file:///c:/Users/spand/college/research_ml_E-nose/diabetes/Diabetes_frontend_ui/backend/app/services/ml_service.py)'s `run_optuna_optimization` method to sample parameters for the active model type.
- **Explainability (SHAP)**: The `TreeExplainer` automatically handles XGBoost, LightGBM, and CatBoost models. If you integrate a Neural Network (CNN), swap the explainer inside `explain_prediction` to `shap.DeepExplainer` or `shap.GradientExplainer`.
- **Metrics & Experiment Logs**: MLflow will record `"xgboost"` as the `model_type` parameter, tracking it in a separate version category automatically.
