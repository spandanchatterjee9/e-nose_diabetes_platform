import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { ExperimentRun } from "../services/api";
import { GitBranch, RefreshCw, Info, HelpCircle } from "lucide-react";

export const ExperimentTracking: React.FC = () => {
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExperiments();
      setRuns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load experiment run logs from MLflow.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="absolute top-10 right-10 w-96 h-96 bg-glow-blue rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Experiment Tracking (MLflow)</h1>
          <p className="text-gray-400 text-sm">Audit training logs, parameters, versions, and metrics recorded to the local MLflow workspace</p>
        </div>
        <button 
          onClick={fetchRuns}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* MLflow details sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HelpCircle className="text-purple-400 w-5 h-5" />
              What is MLflow?
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              **MLflow** is an open-source platform for managing the end-to-end machine learning lifecycle. It covers tracking experiments, packaging code, and sharing models.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              In this prototype, every pipeline execution is treated as an experiment run. MLflow tracks hyperparameters and output classification metrics, guaranteeing research auditability.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Info className="text-blue-400 w-5 h-5" />
              Reproducibility
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Academic research requires strict reproducibility. By versioning data preprocessing parameters (Scaler states) and model weights, we ensure that other labs can achieve identical accuracy outcomes on similar gas sensor arrays.
            </p>
          </div>
        </div>

        {/* Runs Table Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GitBranch className="text-purple-400 w-5 h-5" />
              MLflow Run History
            </h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                <p className="text-xs text-gray-400">Querying SQLite tracking store...</p>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-950/45 border border-red-800/40 rounded-lg text-xs text-red-400">
                {error}
              </div>
            ) : runs.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 leading-relaxed border border-dashed border-slate-800 rounded-lg">
                No runs logged yet in the E-Nose Diabetes Detection database. Run training to create the first experiment log.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-gray-400">
                      <th className="py-3 px-2 font-semibold">Start Time</th>
                      <th className="py-3 px-2 font-semibold">Run ID</th>
                      <th className="py-3 px-2 font-semibold">Model Type</th>
                      <th className="py-3 px-2 font-semibold text-right">Accuracy</th>
                      <th className="py-3 px-2 font-semibold text-right">F1 Score</th>
                      <th className="py-3 px-2 font-semibold text-right">ROC-AUC</th>
                      <th className="py-3 px-2 font-semibold text-right">Parameters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-gray-300">
                    {runs.map((run) => (
                      <tr key={run.run_id} className="hover:bg-slate-900/30 transition">
                        <td className="py-3 px-2 whitespace-nowrap">
                          {new Date(run.start_time).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-400">
                          {run.run_id.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-2 font-bold text-white">
                          {run.parameters.model_type || "Random Forest"}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-white">
                          {run.metrics.accuracy ? `${(run.metrics.accuracy * 100).toFixed(1)}%` : "-"}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-white">
                          {run.metrics.f1_score ? `${(run.metrics.f1_score * 100).toFixed(1)}%` : "-"}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-white">
                          {run.metrics.roc_auc ? `${(run.metrics.roc_auc * 100).toFixed(1)}%` : "-"}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-400 font-mono text-[9px]">
                          {`est=${run.parameters.n_estimators || "N/A"}, depth=${run.parameters.max_depth || "N/A"}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
