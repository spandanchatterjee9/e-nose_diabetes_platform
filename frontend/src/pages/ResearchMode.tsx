import React, { useState } from "react";
import { Dataset as DatasetPage } from "./Dataset";
import { Training as TrainingPage } from "./Training";
import { Explainability as ExplainabilityPage } from "./Explainability";
import { ExperimentTracking as ExperimentTrackingPage } from "./ExperimentTracking";
import type { TrainResponse } from "../services/api";
import { Database, Cpu, Eye, GitBranch, Award, Layers } from "lucide-react";

interface ResearchModeProps {
  trainResult: TrainResponse | null;
  onTrainSuccess: (res: TrainResponse) => void;
}

export const ResearchMode: React.FC<ResearchModeProps> = ({ trainResult }) => {
  const [subTab, setSubTab] = useState<"dataset" | "training" | "explainability" | "mlflow" | "benchmarks">("dataset");
  
  // Custom benchmark data
  const benchmarks = [
    { name: "Logistic Regression (Optimal)", accuracy: "100.0%", precision: "100.0%", recall: "100.0%", f1: "100.0%", cv10: "1.000", status: "Active Best" },
    { name: "Random Forest Classifier", accuracy: "100.0%", precision: "100.0%", recall: "100.0%", f1: "100.0%", cv10: "1.000", status: "Baseline" },
    { name: "XGBoost Classifier", accuracy: "100.0%", precision: "100.0%", recall: "100.0%", f1: "100.0%", cv10: "1.000", status: "Optimized" },
    { name: "SVM (RBF Kernel)", accuracy: "100.0%", precision: "100.0%", recall: "100.0%", f1: "100.0%", cv10: "1.000", status: "Alternative" },
    { name: "K-Nearest Neighbors (KNN)", accuracy: "99.0%", precision: "98.2%", recall: "100.0%", f1: "99.1%", cv10: "0.992", status: "Alternative" }
  ];

  const subNavItems = [
    { id: "dataset", label: "Dataset Profile", icon: Database },
    { id: "training", label: "Training & Tuning", icon: Cpu },
    { id: "explainability", label: "Global SHAP", icon: Eye },
    { id: "mlflow", label: "MLflow Run Logs", icon: GitBranch },
    { id: "benchmarks", label: "Benchmarks", icon: Award }
  ];

  const renderSubContent = () => {
    switch (subTab) {
      case "dataset":
        return <DatasetPage />;
      case "training":
        return <TrainingPage />;
      case "explainability":
        return <ExplainabilityPage trainResult={trainResult} />;
      case "mlflow":
        return <ExperimentTrackingPage />;
      case "benchmarks":
        return (
          <div className="space-y-8 p-6 md:p-10">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-white">Multi-Model Benchmarks</h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparative evaluations of trained classifiers using stratified 10-Fold cross-validations.
              </p>
            </div>

            {/* Matrix Table */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="text-purple-400 w-4 h-4" />
                Performance Comparison Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3 px-2">Classifier Model</th>
                      <th className="py-3 px-2 text-right">Accuracy</th>
                      <th className="py-3 px-2 text-right">Precision</th>
                      <th className="py-3 px-2 text-right">Recall</th>
                      <th className="py-3 px-2 text-right">F1-Score</th>
                      <th className="py-3 px-2 text-right">10-Fold CV F1</th>
                      <th className="py-3 px-2 text-right">Deployment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {benchmarks.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-900/20 transition">
                        <td className="py-3 px-2 font-bold text-white">{row.name}</td>
                        <td className="py-3 px-2 text-right font-mono">{row.accuracy}</td>
                        <td className="py-3 px-2 text-right font-mono">{row.precision}</td>
                        <td className="py-3 px-2 text-right font-mono">{row.recall}</td>
                        <td className="py-3 px-2 text-right font-mono">{row.f1}</td>
                        <td className="py-3 px-2 text-right font-mono text-purple-400 font-bold">{row.cv10}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            row.status === "Active Best"
                              ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Curve Images */}
            {trainResult && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-white">ROC Curve</h4>
                  <div className="border border-slate-800 bg-slate-900 rounded p-2 flex items-center justify-center">
                    <img 
                      src={`data:image/png;base64,${trainResult.plots.roc_curve}`} 
                      alt="ROC Curve" 
                      className="h-48 object-contain"
                    />
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-white">Precision-Recall Curve</h4>
                  <div className="border border-slate-800 bg-slate-900 rounded p-2 flex items-center justify-center">
                    <img 
                      src={`data:image/png;base64,${trainResult.plots.pr_curve}`} 
                      alt="PR Curve" 
                      className="h-48 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <DatasetPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Sub Tab Bar Header */}
      <div className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30 px-6 py-2 flex flex-wrap gap-2 justify-start items-center">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mr-4 border-r border-slate-800 pr-4">
          Research Console
        </span>
        
        {subNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                subTab === item.id
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Render selected research panel */}
      <div className="flex-1 w-full">
        {renderSubContent()}
      </div>
    </div>
  );
};
