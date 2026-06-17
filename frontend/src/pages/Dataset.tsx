import React, { useEffect, useState } from "react";
import { api, type DatasetStats } from "../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FileSpreadsheet, AlertCircle, RefreshCw, Layers } from "lucide-react";

export const Dataset: React.FC = () => {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDatasetStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dataset statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ["#3b82f6", "#ef4444"]; // Blue for Normal, Red for Diabetes

  // Function to map correlation to color intensity
  const getCorrBgColor = (val: number) => {
    const absVal = Math.abs(val);
    if (val > 0) {
      if (absVal > 0.8) return "bg-purple-900/80 text-purple-100";
      if (absVal > 0.6) return "bg-purple-800/60 text-purple-200";
      if (absVal > 0.4) return "bg-purple-700/40 text-purple-300";
      if (absVal > 0.2) return "bg-purple-600/20 text-purple-400";
      return "bg-slate-800/40 text-gray-400";
    } else {
      if (absVal > 0.8) return "bg-rose-900/80 text-rose-100";
      if (absVal > 0.6) return "bg-rose-800/60 text-rose-200";
      if (absVal > 0.4) return "bg-rose-700/40 text-rose-300";
      if (absVal > 0.2) return "bg-rose-600/20 text-rose-400";
      return "bg-slate-800/40 text-gray-400";
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="absolute top-0 right-10 w-96 h-96 bg-glow-purple rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dataset Analysis</h1>
          <p className="text-gray-400 text-sm">Overview of MOS sensor distributions and correlation profiles</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-gray-400 text-sm">Processing sensor telemetry...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-xl border border-red-500/30 flex gap-3 items-center max-w-2xl">
          <AlertCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Error</h3>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        </div>
      ) : stats ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Statistics Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 font-medium uppercase">Total Samples</span>
                <p className="text-3xl font-bold text-white">{stats.total_samples}</p>
              </div>
              <div className="glass-panel p-6 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 font-medium uppercase">Features Sensors</span>
                <p className="text-3xl font-bold text-white">{stats.features.length}</p>
              </div>
              <div className="glass-panel p-6 rounded-xl space-y-1 col-span-2 md:col-span-1">
                <span className="text-xs text-gray-400 font-medium uppercase">Classification</span>
                <p className="text-xl font-bold text-purple-400 mt-1">Binary Target</p>
              </div>
            </div>

            {/* Feature Table */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Layers className="text-purple-400 w-5 h-5" />
                Feature Descriptions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-gray-400">
                      <th className="py-3 px-2 font-semibold">Sensor</th>
                      <th className="py-3 px-2 font-semibold text-right">Mean</th>
                      <th className="py-3 px-2 font-semibold text-right">Std Dev</th>
                      <th className="py-3 px-2 font-semibold text-right">Median</th>
                      <th className="py-3 px-2 font-semibold text-right">Min</th>
                      <th className="py-3 px-2 font-semibold text-right">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-gray-300">
                    {stats.feature_stats.map((row) => (
                      <tr key={row.feature} className="hover:bg-slate-900/30 transition">
                        <td className="py-3 px-2 font-bold text-white">{row.feature}</td>
                        <td className="py-3 px-2 text-right">{row.mean.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right">{row.std.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right">{row.median.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right">{row.min.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right">{row.max.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Correlation Heatmap */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-semibold text-white">Correlation Matrix</h2>
              <p className="text-xs text-gray-400">Measures the linear relationship intensity between chemical sensors.</p>
              <div className="overflow-x-auto pt-2">
                <div className="min-w-[450px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-xs font-semibold text-gray-400 text-left w-16">Sensor</th>
                        {stats.features.map((f) => (
                          <th key={f} className="p-2 text-xs font-semibold text-gray-400 text-center">{f}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.features.map((row_feat, i) => (
                        <tr key={row_feat}>
                          <td className="p-2 text-xs font-bold text-white border border-slate-800/60 bg-slate-900/20">{row_feat}</td>
                          {stats.correlation_matrix[i].map((cell, j) => (
                            <td 
                              key={`${i}-${j}`} 
                              className={`p-3 text-xs font-medium text-center border border-slate-800/80 rounded transition ${getCorrBgColor(cell)}`}
                            >
                              {cell.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Class Distribution Section */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-96">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet className="text-purple-400 w-5 h-5" />
                  Target Class Balance
                </h2>
                <p className="text-xs text-gray-400 mt-1">Diabetes risk binary distribution in sample cohort</p>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.class_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.class_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-400 border-t border-slate-800/80 pt-4">
                {stats.class_distribution.map((entry, i) => {
                  const percentage = ((entry.value / stats.total_samples) * 100).toFixed(1);
                  return (
                    <div key={entry.name}>
                      <span className="font-semibold" style={{ color: COLORS[i] }}>{entry.name}</span>
                      <p className="text-white font-bold text-lg">{entry.value} <span className="text-[10px] text-gray-400 font-light">({percentage}%)</span></p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-white text-md">Feature Insights</h3>
              <ul className="text-xs text-gray-400 space-y-3 leading-relaxed">
                <li>• **TGS2600 & TGS2602** have different sensitivity thresholds which serve as prime indicator features.</li>
                <li>• Class distributions are stratifiably split to prevent biased training profiles.</li>
                <li>• Correlation strengths reveal sensor redundancies that the **Random Forest** will exploit via feature splits.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
