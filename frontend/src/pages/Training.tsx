import React, { useState } from "react";
import { api } from "../services/api";
import type { TrainResponse } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Sliders, Settings, CheckCircle2, Play, RefreshCw, BarChart2, Zap } from "lucide-react";

export const Training: React.FC = () => {
  const [modelName, setModelName] = useState<string>("random_forest");
  const [loading, setLoading] = useState<boolean>(false);
  const [runTuning, setRunTuning] = useState<boolean>(true);
  const [trialsCount, setTrialsCount] = useState<number>(15);
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"metrics" | "plots" | "optuna">("metrics");
 
  const startTraining = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.trainModel(modelName, runTuning, trialsCount);
      setResult(data);
      if (data.trial_history && data.trial_history.length > 0) {
        setActiveTab("metrics");
      }
    } catch (err: any) {
      setError(err.message || "Model training pipeline failed");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="absolute top-0 left-10 w-96 h-96 bg-glow-blue rounded-full pointer-events-none" />
 
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Model Training & Tuning</h1>
        <p className="text-gray-400 text-sm">Optimize hyperparameters via Bayesian search and record metrics to MLflow</p>
      </div>
 
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="glass-panel p-6 rounded-xl space-y-6 h-fit">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="text-purple-400 w-5 h-5" />
            Pipeline Settings
          </h2>
 
          <div className="space-y-4">
            {/* Model Architecture Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Select Model Architecture
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="random_forest">Random Forest Classifier (Baseline)</option>
                <option value="logistic_regression">Logistic Regression</option>
                <option value="xgboost">XGBoost Classifier</option>
                <option value="svm">Support Vector Machine (SVM)</option>
                <option value="knn">K-Nearest Neighbors (KNN)</option>
              </select>
            </div>

            {/* Run Tuning Toggle */}
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-300">Run Hyperparameter Optimization</span>
                <input 
                  type="checkbox" 
                  checked={runTuning}
                  onChange={(e) => setRunTuning(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-800 focus:ring-purple-500 focus:ring-offset-slate-950 focus:ring-2 accent-purple-500"
                />
              </label>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Uses **Optuna** to run automated search for optimal parameters (n_estimators, max_depth, split/leaf size) via cross-validation.
              </p>
            </div>
 
            {/* Trials Count */}
            {runTuning && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Optuna Optimization Trials</span>
                  <span className="font-bold text-purple-400">{trialsCount} trials</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  value={trialsCount}
                  onChange={(e) => setTrialsCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[10px] text-gray-500">
                  Higher counts improve performance but increase execution duration.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={startTraining}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-950/35"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing & Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Pipeline
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-950/45 border border-red-800/40 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results / Progress Column */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !loading ? (
            <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[350px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500">
                <Sliders className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">No Active Session</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto">
                  Start the training pipeline to search hyperparameters, train the Random Forest, and log metrics.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[350px] space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-lg">Running Hyperparameter Optimization</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  Executing Optuna search tree evaluations on stratified folds. MLflow logging workspace initializing...
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-slate-800 gap-6">
                {[
                  { id: "metrics", label: "Model Metrics" },
                  { id: "optuna", label: "Optuna Tuning" },
                  { id: "plots", label: "Session Charts" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
                      activeTab === tab.id 
                        ? "border-purple-500 text-white" 
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Metrics */}
              {activeTab === "metrics" && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-emerald-400 text-xs">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Training Complete!</span> Logged model to MLflow with Run ID: <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px] text-white">{result.run_id}</span>
                    </div>
                  </div>

                  {/* Main Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { name: "Accuracy", val: result.metrics.accuracy },
                      { name: "F1 Score", val: result.metrics.f1_score },
                      { name: "ROC-AUC", val: result.metrics.roc_auc },
                      { name: "Precision", val: result.metrics.precision },
                      { name: "Recall", val: result.metrics.recall }
                    ].map((m) => (
                      <div key={m.name} className="glass-panel p-4 rounded-xl text-center">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">{m.name}</span>
                        <p className="text-xl font-extrabold text-white mt-1">{(m.val * 100).toFixed(2)}%</p>
                      </div>
                    ))}
                  </div>

                  {/* Hyperparameters Grid */}
                  <div className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <BarChart2 className="text-purple-400 w-4 h-4" />
                      Optimized Hyperparameters
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {[
                        { label: "n_estimators", value: result.best_params.n_estimators },
                        { label: "max_depth", value: result.best_params.max_depth || "None" },
                        { label: "min_samples_split", value: result.best_params.min_samples_split },
                        { label: "min_samples_leaf", value: result.best_params.min_samples_leaf }
                      ].map((hp) => (
                        <div key={hp.label} className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-lg">
                          <span className="text-gray-400 font-mono text-[10px] block">{hp.label}</span>
                          <span className="text-white font-bold text-md mt-0.5 block">{hp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Optuna Tuning */}
              {activeTab === "optuna" && (
                <div className="glass-panel p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Optimization History</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Objective value (F1) progression over search space trials</p>
                  </div>
                  {result.trial_history && result.trial_history.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.trial_history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="trial" stroke="#9ca3af" fontSize={11} label={{ value: 'Trial Number', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                          <YAxis stroke="#9ca3af" fontSize={11} domain={[0.5, 1.0]} label={{ value: 'F1 Score', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                          <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                            labelStyle={{ color: "#ffffff" }}
                          />
                          <Line type="monotone" dataKey="value" name="Val F1" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Tuning was bypassed. Default hyperparameters initialized.</p>
                  )}
                </div>
              )}

              {/* Tab 3: Session Charts */}
              {activeTab === "plots" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-panel p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-semibold text-gray-300">Confusion Matrix</h4>
                    <img 
                      src={`data:image/png;base64,${result.plots.confusion_matrix}`} 
                      alt="Confusion Matrix" 
                      className="rounded border border-slate-800 bg-slate-900 w-full"
                    />
                  </div>
                  <div className="glass-panel p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-semibold text-gray-300">SHAP Beeswarm Summary</h4>
                    <img 
                      src={`data:image/png;base64,${result.plots.shap_summary}`} 
                      alt="SHAP summary" 
                      className="rounded border border-slate-800 bg-slate-900 w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
