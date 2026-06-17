# Library Documentation - E-Nose Diabetes Detection AI Research Platform

This document provides a comprehensive analysis of the primary libraries and frameworks deployed in this research platform. For each library, we analyze its core mechanics, rationales for inclusion, academic/scientific significance, commercial industry relevance, and planned future applications.

---

## 1. Optuna

### What it does
Optuna is an open-source, hyperparameter optimization (HPO) framework designed for machine learning. It automates the search for optimal hyperparameters using advanced sampling algorithms (such as Tree-structured Parzen Estimators - TPE) and dynamic trial pruning.

### Why it is used
Manual hyperparameter tuning (trial-and-error) is highly time-consuming and subjective, while Grid Search and Random Search scale poorly to larger parameter spaces. Optuna is used to find the best configuration of the Random Forest model (e.g., `n_estimators`, `max_depth`, `min_samples_split`, `min_samples_leaf`) using Bayesian optimization to maximize cross-validated classification F1 score.

### Research Significance
In scientific publications, finding and reporting optimized hyperparameters demonstrates that the model is evaluated at its peak capability rather than on arbitrary presets, establishing a fair and objective baseline.

### Industry Relevance
Reduces cloud computing expenses and developer overhead by finding high-performing configurations up to 10x faster than grid search.

### Future Use Cases
As deep learning models (like CNNs or LSTMs) are added to the platform, Optuna will tune learning rates, batch sizes, layer counts, and dropout rates dynamically.

---

## 2. SHAP (SHapley Additive exPlanations)

### What it does
SHAP is a game theoretic approach to explain the outputs of machine learning models. It connects cooperative game theory (Shapley values) with local explanations to provide fair feature attribution scores for individual predictions.

### Why it is used
Tree-based models like Random Forests are non-linear and complex. SHAP is used to explain **globally** which sensors drive the classification, and **locally** which sensor spikes pushed a specific patient's breath sample towards a "Diabetic" or "Normal" classification.

### Research Significance
Solves the "black box" machine learning problem, making the research acceptable for peer-reviewed medical and bioinformatics journals that require interpretable decision paths.

### Industry Relevance
Essential for compliance with regulatory standards (e.g., EU's GDPR "Right to Explanation" and FDA guidelines for Software as a Medical Device).

### Future Use Cases
Explaining deep learning model predictions using specialized explainers like `DeepExplainer` or `GradientExplainer`.

---

## 3. MLflow

### What it does
MLflow is an end-to-end platform for managing the ML lifecycle. It provides capabilities for tracking experiments (parameters, metrics, code, files), packaging models, and registering model versions.

### Why it is used
It provides a centralized tracking repository. Every training session logs the exact dataset version, hyperparameter selections, output performance metrics (F1, Accuracy, ROC-AUC), and generated visualization plots.

### Research Significance
Ensures scientific reproducibility. Any researcher can download the exact model checkpoint and scaler states logged under a specific `Run ID` to recreate the results.

### Industry Relevance
Enables ML Engineering teams to manage model governance, monitor model drift, and audit production deployments.

### Future Use Cases
Logging deep learning neural network training epochs and hosting a model registry to support seamless blue/green production rollouts.

---

## 4. FastAPI

### What it does
FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+ based on standard Python type hints.

### Why it is used
It serves as the backend engine. It compiles input data, executes predictions via scikit-learn, computes SHAP values, and exposes clean REST endpoints with auto-generated OpenAPI documentation.

### Research Significance
Allows ML researchers to easily package python research scripts into web services that can be consumed by multi-disciplinary frontend teams or web clients.

### Industry Relevance
One of the fastest Python frameworks available, matching the performance of Go and Node.js in asynchronous I/O benchmarks.

### Future Use Cases
Streaming real-time sensor array signals via WebSockets to support continuous breath monitoring diagnostics.

---

## 5. React (with TypeScript & TailwindCSS)

### What it does
React is a declarative component-based user interface library. TypeScript adds compile-time static type safety, and TailwindCSS provides a utility-first styling system.

### Why it is used
Enables the creation of a dashboard containing real-time status indicators, interactive Recharts plotting utilities, and detailed research documentation.

### Research Significance
Bridges the gap between raw data analysis and practical clinical utility by providing medical practitioners with an accessible user interface.

### Industry Relevance
Standard framework for building enterprise-grade dashboard products with high component reuse.

### Future Use Cases
Integrating live dashboard notifications, collaborative annotation modules, and multi-patient search.

---

## 6. Random Forest Classifier

### What it does
Random Forest is an ensemble learning method that constructs a multitude of decision trees at training time and outputs the class that is the mode of the classes (classification) of the individual trees.

### Why it is used
It serves as the baseline model. It handles non-linear relationships, is robust to outliers, has built-in resistance to overfitting, and provides internal feature importance metrics.

### Research Significance
Serves as the standard machine learning benchmark in medical classification tasks before testing deep neural networks.

### Industry Relevance
Widely utilized in tabular data applications due to its high accuracy, fast training speeds, and low hyperparameter sensitivity.

### Future Use Cases
Serves as the reference model against which future deep learning classifiers (e.g. 1D CNNs) will be benchmarked on the dashboard.
