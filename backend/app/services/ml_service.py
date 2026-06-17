import os
import io
import base64
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve
)
import optuna
import shap
import mlflow
import pickle
from app.models.model_factory import get_model, MODEL_REGISTRY
from app.services.explain_service import ExplainService

optuna.logging.set_verbosity(optuna.logging.WARNING)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(os.path.dirname(BASE_DIR), "enose_dataset_to_predict_human_disease.csv")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Set MLflow tracking
mlflow.set_tracking_uri(f"sqlite:///{os.path.join(os.path.dirname(BASE_DIR), 'mlflow', 'mlflow.db')}")
mlflow.set_experiment("E-Nose_Diabetes_Detection")

FEATURE_COLUMNS = ["TGS2600", "TGS2602", "TGS2610", "TGS2611", "TGS2620", "TGS826"]
TARGET_COLUMN = "Subjek"

class MLService:
    @staticmethod
    def load_raw_data() -> pd.DataFrame:
        """Loads the raw E-Nose CSV dataset."""
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Dataset not found at: {DATA_PATH}")
        return pd.read_csv(DATA_PATH)

    @staticmethod
    def get_dataset_stats() -> dict:
        """Returns statistics of the dataset for the UI frontend."""
        df = MLService.load_raw_data()
        total_samples = len(df)
        class_counts = df[TARGET_COLUMN].value_counts().to_dict()
        
        feature_stats = []
        for col in FEATURE_COLUMNS:
            feature_stats.append({
                "feature": col,
                "mean": float(df[col].mean()),
                "std": float(df[col].std()),
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "median": float(df[col].median())
            })
            
        class_dist = [
            {"name": k, "value": int(v)} for k, v in class_counts.items()
        ]
        
        corr = df[FEATURE_COLUMNS].corr().round(3).values.tolist()
        
        return {
            "total_samples": total_samples,
            "class_distribution": class_dist,
            "feature_stats": feature_stats,
            "correlation_matrix": corr,
            "features": FEATURE_COLUMNS
        }

    @staticmethod
    def load_and_preprocess_data():
        """Loads and preprocesses data, saving standardization parameters."""
        df = MLService.load_raw_data()
        X = df[FEATURE_COLUMNS].values
        y = df[TARGET_COLUMN].map({"Normal": 0, "Diabetes": 1}).values
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Save scaler
        with open(os.path.join(ARTIFACTS_DIR, "scaler.pkl"), "wb") as f:
            pickle.dump(scaler, f)
            
        # Save background slice for KernelExplainer SHAP
        background_sample = X_train_scaled[:50]
        with open(os.path.join(ARTIFACTS_DIR, "background.pkl"), "wb") as f:
            pickle.dump(background_sample, f)
            
        return X_train_scaled, X_test_scaled, y_train, y_test, scaler

    @staticmethod
    def run_optuna_optimization(X_train, y_train, model_name: str, n_trials=15) -> tuple:
        """Runs Optuna hyperparameter tuning for a selected model type."""
        trial_history = []

        def objective(trial):
            # Propose model-specific hyperparameters
            if model_name == "random_forest":
                params = {
                    "n_estimators": trial.suggest_int("n_estimators", 10, 250),
                    "max_depth": trial.suggest_int("max_depth", 2, 24),
                    "min_samples_split": trial.suggest_int("min_samples_split", 2, 15),
                    "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 10),
                    "random_state": 42
                }
            elif model_name == "logistic_regression":
                params = {
                    "C": trial.suggest_float("C", 1e-4, 1e2, log=True),
                    "max_iter": 1000,
                    "random_state": 42
                }
            elif model_name == "xgboost":
                params = {
                    "n_estimators": trial.suggest_int("n_estimators", 10, 200),
                    "max_depth": trial.suggest_int("max_depth", 2, 10),
                    "learning_rate": trial.suggest_float("learning_rate", 1e-3, 1e-1, log=True),
                    "random_state": 42,
                    "eval_metric": "logloss",
                    "n_jobs": -1
                }
            elif model_name == "svm":
                params = {
                    "C": trial.suggest_float("C", 1e-3, 1e2, log=True),
                    "gamma": trial.suggest_categorical("gamma", ["scale", "auto"]),
                    "probability": True,
                    "random_state": 42
                }
            elif model_name == "knn":
                params = {
                    "n_neighbors": trial.suggest_int("n_neighbors", 1, 15),
                    "weights": trial.suggest_categorical("weights", ["uniform", "distance"])
                }
            else:
                params = {}

            # 5-Fold Stratified CV
            kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            f1_scores = []
            
            for train_idx, val_idx in kf.split(X_train, y_train):
                X_tr, X_val = X_train[train_idx], X_train[val_idx]
                y_tr, y_val = y_train[train_idx], y_train[val_idx]
                
                clf = get_model(model_name, **params)
                clf.train(X_tr, y_tr)
                preds = clf.predict(X_val)
                f1_scores.append(f1_score(y_val, preds, zero_division=0))
                
            mean_f1 = np.mean(f1_scores)
            trial_history.append({
                "trial": trial.number,
                "value": float(mean_f1),
                "params": params
            })
            return mean_f1

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=n_trials)
        return study.best_params, trial_history

    @staticmethod
    def generate_plots_base64(y_test, y_pred, y_prob, model_obj, model_name) -> dict:
        """Generates visual analysis plots for the UI frontend."""
        plots = {}
        plt.style.use('default')
        sns.set_theme(style="whitegrid")
        
        # 1. Confusion Matrix
        fig, ax = plt.subplots(figsize=(5, 4))
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                    xticklabels=['Normal', 'Diabetes'], yticklabels=['Normal', 'Diabetes'], ax=ax)
        ax.set_ylabel('True Label')
        ax.set_xlabel('Predicted Label')
        ax.set_title(f'Confusion Matrix ({model_name})')
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        plots['confusion_matrix'] = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.savefig(os.path.join(ARTIFACTS_DIR, "confusion_matrix.png"), dpi=200)
        plt.close(fig)

        # 2. ROC Curve
        fig, ax = plt.subplots(figsize=(5, 4))
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc = roc_auc_score(y_test, y_prob)
        ax.plot(fpr, tpr, color='#3b82f6', lw=2, label=f'AUC = {auc:.3f}')
        ax.plot([0, 1], [0, 1], color='#ef4444', lw=1, linestyle='--')
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel('False Positive Rate')
        ax.set_ylabel('True Positive Rate')
        ax.set_title(f'ROC Curve ({model_name})')
        ax.legend(loc="lower right")
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        plots['roc_curve'] = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.savefig(os.path.join(ARTIFACTS_DIR, "roc_curve.png"), dpi=200)
        plt.close(fig)

        # 3. Precision-Recall Curve
        fig, ax = plt.subplots(figsize=(5, 4))
        precision, recall, _ = precision_recall_curve(y_test, y_prob)
        ax.plot(recall, precision, color='#10b981', lw=2)
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel('Recall')
        ax.set_ylabel('Precision')
        ax.set_title(f'Precision-Recall Curve ({model_name})')
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        plots['pr_curve'] = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.savefig(os.path.join(ARTIFACTS_DIR, "pr_curve.png"), dpi=200)
        plt.close(fig)

        # 4. Feature Importance (RF/XGB support, fallbacks for linear coefficients)
        fig, ax = plt.subplots(figsize=(5, 4))
        has_importance = False
        importances = np.zeros(len(FEATURE_COLUMNS))
        
        if hasattr(model_obj.model, "feature_importances_"):
            importances = model_obj.model.feature_importances_
            has_importance = True
        elif hasattr(model_obj.model, "coef_"):
            importances = np.abs(model_obj.model.coef_[0])
            # normalize
            if importances.sum() > 0:
                importances = importances / importances.sum()
            has_importance = True
            
        if has_importance:
            indices = np.argsort(importances)
            ax.barh(range(len(indices)), importances[indices], color='#8b5cf6', align='center')
            ax.set_yticks(range(len(indices)))
            ax.set_yticklabels([FEATURE_COLUMNS[i] for i in indices])
            ax.set_xlabel('Importance Value')
            ax.set_title('Feature Importance Breakdown')
        else:
            # KNN/SVM fallback empty chart
            ax.text(0.5, 0.5, "Importance not natively supported\nby active model architecture", 
                    ha='center', va='center', fontsize=11, color='gray')
            ax.set_axis_off()
            
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        plots['feature_importance'] = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.savefig(os.path.join(ARTIFACTS_DIR, "feature_importance.png"), dpi=200)
        plt.close(fig)
        
        return plots

    @staticmethod
    def train_and_log_model(model_name: str = "random_forest", run_tuning: bool = True, n_trials: int = 15) -> dict:
        """Trains and logs the selected model, updating serialization and reports."""
        # 1. Preprocess data
        X_train, X_test, y_train, y_test, scaler = MLService.load_and_preprocess_data()
        
        # Default baseline parameters
        default_params = {
            "random_state": 42
        }
        if model_name == "random_forest":
            default_params.update({"n_estimators": 100, "n_jobs": -1})
        elif model_name == "logistic_regression":
            default_params.update({"max_iter": 1000})
        elif model_name == "xgboost":
            default_params.update({"n_estimators": 100, "eval_metric": "logloss", "n_jobs": -1})
        elif model_name == "svm":
            default_params.update({"probability": True})
            
        best_params = default_params.copy()
        trial_history = []
        
        # 2. Hyperparameter optimization
        if run_tuning:
            opt_params, trial_history = MLService.run_optuna_optimization(X_train, y_train, model_name, n_trials=n_trials)
            best_params.update(opt_params)
            
        # 3. Train Model
        clf_wrapper = get_model(model_name, **best_params)
        clf_wrapper.train(X_train, y_train)
        
        # Predict & Evaluate
        y_pred = clf_wrapper.predict(X_test)
        y_prob = clf_wrapper.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_prob)
        
        # Generate & Save evaluation plots
        plots = MLService.generate_plots_base64(y_test, y_pred, y_prob, clf_wrapper, model_name)
        
        # Save model pkl to host / container artifacts
        model_path = os.path.join(ARTIFACTS_DIR, "model.pkl")
        clf_wrapper.save(model_path)
        
        # Save model to general best_model paths as well
        best_model_dir_backend = r"c:\Users\spand\college\research_ml_E-nose\diabetes\Diabetes_frontend_ui\backend\app\trained_models"
        best_model_dir_root = r"c:\Users\spand\college\research_ml_E-nose\diabetes\Diabetes_frontend_ui\trained_models"
        os.makedirs(best_model_dir_backend, exist_ok=True)
        os.makedirs(best_model_dir_root, exist_ok=True)
        clf_wrapper.save(os.path.join(best_model_dir_backend, "best_model.pkl"))
        clf_wrapper.save(os.path.join(best_model_dir_root, "best_model.pkl"))
        
        # 5. SHAP values generation
        explainer = ExplainService.get_explainer(clf_wrapper.model, X_train_scaled=X_train)
        
        # Save Explainer for later use
        with open(os.path.join(ARTIFACTS_DIR, "explainer.pkl"), "wb") as f:
            pickle.dump(explainer, f)
            
        # Calculate test SHAP values
        single_shap = explainer.shap_values(X_test)
        if isinstance(single_shap, list):
            shap_values_pos = single_shap[1]
        else:
            if len(single_shap.shape) == 3:
                shap_values_pos = single_shap[:, :, 1]
            else:
                shap_values_pos = single_shap

        # Generate static beeswarm summary plot
        fig, ax = plt.subplots(figsize=(6, 4.5))
        shap.summary_plot(shap_values_pos, X_test, feature_names=FEATURE_COLUMNS, show=False)
        plt.title(f"SHAP Beeswarm Plot ({model_name})")
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        plots['shap_summary'] = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.savefig(os.path.join(ARTIFACTS_DIR, "shap_summary.png"), dpi=200)
        plt.close(fig)
        
        # Calculate feature attribution for Recharts bar chart
        if len(shap_values_pos.shape) == 2:
            global_shap_importance = np.abs(shap_values_pos).mean(axis=0).tolist()
        else:
            global_shap_importance = np.abs(shap_values_pos).mean(axis=0).tolist()
            
        shap_data = [
            {"feature": f, "importance": float(imp)} 
            for f, imp in zip(FEATURE_COLUMNS, global_shap_importance)
        ]
        shap_data = sorted(shap_data, key=lambda x: x["importance"], reverse=True)

        # 6. MLflow log
        try:
            with mlflow.start_run() as run:
                for k, v in best_params.items():
                    mlflow.log_param(k, v)
                mlflow.log_param("model_type", model_name)
                
                mlflow.log_metric("accuracy", accuracy)
                mlflow.log_metric("precision", precision)
                mlflow.log_metric("recall", recall)
                mlflow.log_metric("f1_score", f1)
                mlflow.log_metric("roc_auc", auc)
                
                mlflow.log_artifact(model_path)
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "confusion_matrix.png"))
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "roc_curve.png"))
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "pr_curve.png"))
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "feature_importance.png"))
                mlflow.log_artifact(os.path.join(ARTIFACTS_DIR, "shap_summary.png"))
                
                run_id = run.info.run_id
        except Exception as mlflow_err:
            print("MLflow logging skipped or failed:", mlflow_err)
            run_id = "local_only"
            
        # Compile parameter mapping returned to frontend without private variables
        filtered_params = {k: v for k, v in best_params.items() if k not in ["random_state", "n_jobs", "probability"]}
        
        return {
            "run_id": run_id,
            "best_params": filtered_params,
            "metrics": {
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "roc_auc": float(auc)
            },
            "plots": plots,
            "shap_importance": shap_data,
            "trial_history": trial_history
        }

    @staticmethod
    def get_mlflow_runs() -> list:
        """Retrieves history of model runs from local MLflow client db."""
        try:
            client = mlflow.tracking.MlflowClient(tracking_uri=mlflow.get_tracking_uri())
            experiment = client.get_experiment_by_name("E-Nose_Diabetes_Detection")
            if not experiment:
                return []
            
            runs = client.search_runs(experiment_ids=[experiment.experiment_id])
            runs_list = []
            for r in runs:
                data = r.data
                runs_list.append({
                    "run_id": r.info.run_id,
                    "status": r.info.status,
                    "start_time": pd.to_datetime(r.info.start_time, unit='ms').isoformat(),
                    "parameters": data.params,
                    "metrics": {k: float(v) for k, v in data.metrics.items()}
                })
            return runs_list
        except Exception as e:
            return []
