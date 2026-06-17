import os
import pickle
import io
import base64
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import shap

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
FEATURE_COLUMNS = ["TGS2600", "TGS2602", "TGS2610", "TGS2611", "TGS2620", "TGS826"]

class ExplainService:
    @staticmethod
    def get_explainer(model, X_train_scaled=None):
        """
        Dynamically initializes the appropriate SHAP explainer based on model class.
        Saves the explainer state if possible.
        """
        explainer_path = os.path.join(ARTIFACTS_DIR, "explainer.pkl")
        
        # If explainer is already saved and model matches, try to load it
        if X_train_scaled is None and os.path.exists(explainer_path):
            try:
                with open(explainer_path, "rb") as f:
                    return pickle.load(f)
            except:
                pass
                
        model_name = model.__class__.__name__
        
        # Check model type and choose appropriate SHAP explainer
        if "RandomForest" in model_name or "XGB" in model_name or "GradientBoosting" in model_name:
            explainer = shap.TreeExplainer(model)
        elif "LogisticRegression" in model_name or "Ridge" in model_name:
            if X_train_scaled is not None:
                explainer = shap.LinearExplainer(model, X_train_scaled)
            else:
                # Fallback to general explainer
                explainer = shap.Explainer(model, np.zeros((1, len(FEATURE_COLUMNS))))
        else:
            # For SVM, KNN, etc. - use KernelExplainer
            # Load background data or fallback to synthetic zero-mean background
            background_path = os.path.join(ARTIFACTS_DIR, "background.pkl")
            if os.path.exists(background_path):
                with open(background_path, "rb") as f:
                    bg_data = pickle.load(f)
            else:
                bg_data = np.zeros((10, len(FEATURE_COLUMNS)))
                
            # KernelExplainer works on predict_proba
            explainer = shap.KernelExplainer(model.predict_proba, bg_data)
            
        return explainer

    @staticmethod
    def explain_prediction(features: dict, model, scaler) -> dict:
        """
        Computes local SHAP values for a single patient sample and returns plots & metrics.
        """
        # Extract features array in proper order
        raw_values = np.array([[features[col] for col in FEATURE_COLUMNS]])
        scaled_values = scaler.transform(raw_values)
        
        # Predict class & prob
        pred_class_idx = int(model.predict(scaled_values)[0])
        pred_probs = model.predict_proba(scaled_values)[0]
        confidence = float(pred_probs[pred_class_idx])
        pred_label = "Diabetes" if pred_class_idx == 1 else "Normal"
        
        # Get appropriate explainer
        explainer = ExplainService.get_explainer(model)
        
        # Calculate SHAP values
        single_shap = explainer.shap_values(scaled_values)
        
        # Handle SHAP multi-class format differences
        # For Kernel/Tree binary classifiers: shap_values can be a list [class0_shap, class1_shap] or single array
        if isinstance(single_shap, list):
            single_shap_pos = single_shap[1][0]
            expected_val = float(explainer.expected_value[1])
        else:
            if len(single_shap.shape) == 3: # shape: (n_samples, n_features, n_classes)
                single_shap_pos = single_shap[0, :, 1]
                expected_val = float(explainer.expected_value[1])
            elif len(single_shap.shape) == 2: # shape: (n_samples, n_features)
                # If binary, index 1 could be default, check expected_value
                single_shap_pos = single_shap[0]
                if isinstance(explainer.expected_value, (list, np.ndarray)) and len(explainer.expected_value) > 1:
                    expected_val = float(explainer.expected_value[1])
                else:
                    expected_val = float(explainer.expected_value)
            else:
                single_shap_pos = single_shap
                expected_val = float(explainer.expected_value)
                
        # Feature impact contributions
        feature_contributions = []
        for i, col in enumerate(FEATURE_COLUMNS):
            feature_contributions.append({
                "feature": col,
                "raw_value": float(raw_values[0, i]),
                "shap_value": float(single_shap_pos[i]),
                "direction": "Diabetic Contribution" if single_shap_pos[i] > 0 else "Normal Contribution"
            })
            
        # Sort contributions by absolute impact
        sorted_contributions = sorted(feature_contributions, key=lambda x: abs(x["shap_value"]), reverse=True)
        top_feature = sorted_contributions[0]["feature"]
        top_direction = "increased" if sorted_contributions[0]["shap_value"] > 0 else "decreased"
        
        human_readable = (
            f"Sensor {top_feature} had the strongest impact on the diagnosis prediction, which "
            f"{top_direction} the risk score of diabetes for this patient. "
        )
        
        if pred_label == "Diabetes":
            human_readable += (
                f"Elevated readings in sensors like TGS2610 and TGS2611 indicate higher concentrations "
                f"of breath volatile organic compounds associated with hyperglycemia."
            )
        else:
            human_readable += (
                f"The breath profile shows normal sensor resistance levels, indicating a standard metabolic state."
            )

        # Generate individual SHAP waterfall-style plot
        fig, ax = plt.subplots(figsize=(6, 4))
        y_pos = np.arange(len(FEATURE_COLUMNS))
        shap_vals = np.array([fc["shap_value"] for fc in feature_contributions])
        features_lbls = [f"{fc['feature']} ({fc['raw_value']:.2f})" for fc in feature_contributions]
        
        # Sort by impact absolute value
        sort_idx = np.argsort(np.abs(shap_vals))
        
        colors = ['#ef4444' if val > 0 else '#3b82f6' for val in shap_vals[sort_idx]]
        ax.barh(y_pos, shap_vals[sort_idx], color=colors, align='center')
        ax.set_yticks(y_pos)
        ax.set_yticklabels([features_lbls[i] for i in sort_idx])
        ax.axvline(0, color='black', lw=1, ls='--')
        ax.set_xlabel('SHAP value (Diabetes Risk Impact)')
        ax.set_title('Feature Contribution Breakdown')
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150)
        buf.seek(0)
        waterfall_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        
        return {
            "prediction": pred_label,
            "class_index": pred_class_idx,
            "confidence": confidence,
            "expected_value": expected_val,
            "contributions": feature_contributions,
            "waterfall_plot": waterfall_b64,
            "human_readable": human_readable
        }
