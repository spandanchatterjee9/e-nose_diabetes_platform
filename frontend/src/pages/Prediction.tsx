import React, { useState } from "react";
import { api } from "../services/api";
import type { PredictionResponse } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Activity, AlertTriangle, ShieldCheck, Heart, ClipboardList } from "lucide-react";

export const Prediction: React.FC = () => {
  // Initial state values pre-populated with typical Diabetic values from raw dataset
  const [inputs, setInputs] = useState({
    TGS2600: 23.65,
    TGS2602: 58.33,
    TGS2610: 15.02,
    TGS2611: 10.16,
    TGS2620: 24.50,
    TGS826: 30.04
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preset profiles for easy evaluation
  const profiles = [
    {
      name: "Normal Breath Profile",
      values: { TGS2600: 25.41, TGS2602: 44.06, TGS2610: 28.97, TGS2611: 14.30, TGS2620: 27.24, TGS826: 22.53 }
    },
    {
      name: "Diabetic Breath Profile",
      values: { TGS2600: 9.67, TGS2602: 64.74, TGS2610: 10.48, TGS2611: 2.33, TGS2620: 10.84, TGS826: 36.76 }
    }
  ];

  const handleInputChange = (field: string, val: string) => {
    const floatVal = parseFloat(val);
    setInputs(prev => ({
      ...prev,
      [field]: isNaN(floatVal) ? 0 : floatVal
    }));
  };

  const applyProfile = (vals: typeof inputs) => {
    setInputs(vals);
    setResult(null);
    setError(null);
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictDiabetes(inputs);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to make diagnostic prediction. Ensure a model has been trained first.");
    } finally {
      setLoading(false);
    }
  };

  // Format SHAP contributions for horizontal chart
  const shapChartData = result?.contributions.map(item => ({
    name: item.feature,
    value: item.shap_value,
    raw: item.raw_value
  })).sort((a, b) => Math.abs(a.value) - Math.abs(b.value)) || [];

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="absolute top-0 right-10 w-96 h-96 bg-glow-pink rounded-full pointer-events-none" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Diagnostic Prediction</h1>
        <p className="text-gray-400 text-sm">Enter E-Nose sensor resistances to evaluate patient diabetes risk with local SHAP attribution</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Inputs Column */}
        <div className="glass-panel p-6 rounded-xl space-y-6 h-fit">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList className="text-purple-400 w-5 h-5" />
              Patient Metrics
            </h2>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Quick Presets</span>
            <div className="flex flex-col gap-2">
              {profiles.map(p => (
                <button
                  key={p.name}
                  onClick={() => applyProfile(p.values)}
                  className="w-full text-left px-3 py-2 text-xs rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-gray-300 hover:text-white transition flex justify-between items-center"
                >
                  <span>{p.name}</span>
                  <span className="text-[9px] bg-slate-800 text-purple-400 px-1.5 py-0.5 rounded border border-slate-700">Load</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sensor Inputs Form */}
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(inputs).map((sensor) => (
              <div key={sensor} className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                  {sensor}
                  <span className="text-[9px] text-gray-500 font-normal">(ohm)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs[sensor as keyof typeof inputs]}
                  onChange={(e) => handleInputChange(sensor, e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            ))}
          </div>

          <button
            onClick={runPrediction}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-lg shadow-pink-950/25"
          >
            {loading ? "Generating Diagnostic..." : "Run Diagnosis"}
          </button>

          {error && (
            <div className="p-3 bg-red-950/45 border border-red-800/40 rounded-lg text-xs text-red-400 flex gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Diagnostic Outcome Column */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !loading ? (
            <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Awaiting Breath Telemetry</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto">
                  Provide patient E-Nose sensor readings in the left column and execute diagnostics to see predictive results.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
              <div>
                <h3 className="font-semibold text-white text-lg">Computing Prediction Explanations</h3>
                <p className="text-xs text-gray-400">Scaling values and solving local Shapley values using TreeExplainer...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Diagnosis Output Card */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Status card */}
                <div className={`md:col-span-2 glass-panel p-6 rounded-xl flex items-center gap-6 border-l-4 ${
                  result.prediction === "Diabetes" ? "border-l-red-500" : "border-l-emerald-500"
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    result.prediction === "Diabetes" ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {result.prediction === "Diabetes" ? (
                      <Heart className="w-8 h-8 fill-current text-red-500 animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Classification Outcome</span>
                    <h3 className="text-2xl font-bold text-white leading-none">{result.prediction}</h3>
                    <p className="text-xs text-gray-400 leading-normal pt-1">
                      {result.prediction === "Diabetes" 
                        ? "Sensor signature indicates high likelihood of diabetic biomarker exhale concentrations." 
                        : "Sensor signature corresponds to standard normal profile parameters."
                      }
                    </p>
                  </div>
                </div>

                {/* Confidence card */}
                <div className="glass-panel p-6 rounded-xl flex flex-col justify-center text-center">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Diagnostic Confidence</span>
                  <p className="text-3xl font-extrabold text-white mt-2">{(result.confidence * 100).toFixed(1)}%</p>
                  {/* Gauge indicator bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className={`h-full rounded-full ${result.prediction === "Diabetes" ? "bg-red-500" : "bg-emerald-500"}`} 
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Local SHAP Explainability plots */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Interactive bar chart */}
                <div className="glass-panel p-6 rounded-xl space-y-4">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Interactive SHAP Contributions</h3>
                    <p className="text-xs text-gray-400">Shows how each gas sensor influenced this specific diagnosis</p>
                  </div>
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={shapChartData} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} />
                        <Tooltip
                          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                          labelStyle={{ color: "#ffffff" }}
                          formatter={(value: any) => [`Impact: ${parseFloat(value).toFixed(4)}`, "Contribution"]}
                        />
                        <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                        <Bar dataKey="value">
                          {shapChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#ef4444" : "#3b82f6"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Static Waterfall Plot from Matplotlib */}
                <div className="glass-panel p-6 rounded-xl space-y-4">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Local SHAP Waterfall</h3>
                    <p className="text-xs text-gray-400 font-light">Publication-quality waterfall attribution export</p>
                  </div>
                  <div className="border border-slate-800 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
                    <img 
                      src={`data:image/png;base64,${result.waterfall_plot}`} 
                      alt="Waterfall SHAP explanation" 
                      className="w-full max-h-56 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
