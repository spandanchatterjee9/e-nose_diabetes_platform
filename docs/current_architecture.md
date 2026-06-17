# Current Architecture Audit - E-Nose Diabetes Detection Prototype

This document provides a detailed technical audit of the E-Nose Diabetes Detection project prior to architectural refactoring. It describes the existing layout, routing, models, data handling, and deployment setup.

---

## 📂 1. Directory Structure

Prior to refactoring, the codebase is organized as follows:
```
Diabetes_frontend_ui/
├── backend/
│   ├── app/
│   │   ├── artifacts/        # Serialized models, scalers, and evaluation plots
│   │   ├── models/
│   │   │   ├── base_model.py # Abstract model base class
│   │   │   ├── rf_model.py   # Random Forest wrapper
│   │   │   └── model_factory.py # Model registry factory
│   │   ├── services/
│   │   │   └── ml_service.py # Monolithic ML logic (data, tuning, SHAP, MLflow)
│   │   └── main.py           # FastAPI entry point & routers
│   ├── mlflow/               # Host mount for named volume SQLite DB
│   ├── mlruns/               # MLflow file registry (fallback directory)
│   ├── Dockerfile            # Backend Docker instructions
│   └── requirements.txt      # Python package list
├── frontend/
│   ├── src/
│   │   ├── pages/            # View components (Home, Dataset, Training, etc.)
│   │   ├── services/
│   │   │   └── api.ts        # Fetch client mapping to FastAPI
│   │   ├── App.tsx           # Navigation framework and layout
│   │   └── main.tsx          # React application root
│   ├── tailwind.config.js    # Tailwind configuration (v3)
│   ├── index.html            # Static HTML wrapper
│   └── Dockerfile            # React web build & Nginx hosting
├── docs/                     # Reference documents
└── docker-compose.yml        # Multi-container service orchestrator
```

---

## 🔌 2. Existing REST API Endpoints

FastAPI exposes the following endpoints on port `8000`:

| Method | Endpoint | Description | Request Schema | Response Schema |
|--------|----------|-------------|----------------|-----------------|
| **GET** | `/` | Service health status check | None | `{"status": "healthy", ...}` |
| **GET** | `/api/dataset/stats` | Loads raw CSV and calculates summary statistics | None | `DatasetStats` (means, shapes, correlation matrix) |
| **POST** | `/api/train` | Triggers preprocessing, Optuna tuning, and MLflow logging | `TrainRequest` (tuning toggle, n_trials) | `TrainResponse` (metrics, parameter dict, plot binaries) |
| **POST** | `/api/predict` | Computes diabetes diagnosis class and local SHAP contributions | `PredictRequest` (6 sensor floats) | `PredictionResponse` (prediction, confidence, waterfall plot) |
| **GET** | `/api/experiments` | Queries MLflow's SQLite database client for historical runs | None | `List[ExperimentRun]` (parameters, metrics, timestamp) |

---

## 🤖 3. Existing Model Pipeline & ML Logic

### Models
Currently, only a single model is implemented:
- **Random Forest Classifier** (`RandomForestClassifier` from scikit-learn).
- Instantiated through `model_factory.py` using `RandomForestModel` which extends `BaseModel`.

### Pipeline Execution (`ml_service.py`)
1. **Data Preprocessing**:
   - Reads `enose_dataset_to_predict_human_disease.csv` from root.
   - Extracts features: `TGS2600`, `TGS2602`, `TGS2610`, `TGS2611`, `TGS2620`, `TGS826`.
   - Ignores: `Time(s)`, `Number`.
   - Encodes targets: `Normal` -> 0, `Diabetes` -> 1.
   - Splits 80/20 train/test stratified by class target.
   - Fits `StandardScaler` on training set, scales test set, and serializes scaler to `artifacts/scaler.pkl`.
2. **Hyperparameter Optimization**:
   - Optuna study optimizes Random Forest parameters: `n_estimators`, `max_depth`, `min_samples_split`, `min_samples_leaf` using 5-Fold cross-validation F1-score.
3. **Training & Inference**:
   - Trains on the full training set using best parameters and serializes model to `artifacts/model.pkl`.
4. **Explainability**:
   - Instantiates a `TreeExplainer` from SHAP and serializes it to `artifacts/explainer.pkl`.
   - Generates static beeswarm plot binaries.
5. **Experiment Tracking**:
   - Logs hyperparameters, evaluation metrics (Accuracy, Precision, Recall, F1, AUC), and plots to MLflow via a SQLite database URI.

---

## 🐳 4. Existing Docker Setup

Orchestrated using `docker-compose.yml`:
- **Backend Container**: Built from `backend/Dockerfile` (python:3.11-slim base). Mounts dataset and artifacts host folders, shares ports on `8000`, and binds `/app/mlflow` to named docker volume `mlflow-data` to prevent WSL/Windows POSIX database locks.
- **Frontend Container**: Built from `frontend/Dockerfile` (multi-stage node:18 build, nginx:alpine runtime). Bundles React SPA and hosts static assets via Nginx. Shares port `3000` mapping to container port `80`.

---

## 🖥️ 5. Existing Frontend structure

Built with React, Vite, TypeScript, and TailwindCSS (v3):
- Single Page Application with dynamic client-side tab navigation managed via state inside `App.tsx`.
- Charts and gauges rendered using `recharts` and inline SVG overlays.
- Side navigation exposes: Research Overview, Dataset Profile, Training & Tuning, Diagnostic Predict, Explainable AI (SHAP), MLflow Experiments, Metrics Dashboard.
