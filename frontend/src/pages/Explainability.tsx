import React from "react";
import { Info, HelpCircle, EyeOff, Layers, Activity } from "lucide-react";
import type { TrainResponse } from "../services/api";

interface ExplainabilityProps {
  trainResult: TrainResponse | null;
}

export const Explainability: React.FC<ExplainabilityProps> = ({ trainResult }) => {
  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="absolute top-10 left-10 w-96 h-96 bg-glow-purple rounded-full pointer-events-none" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Explainable AI (SHAP)</h1>
        <p className="text-gray-400 text-sm">Interpret model decisions, verify safety, and audit gas sensor feature relevance globally</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* SHAP Educational Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HelpCircle className="text-purple-400 w-5 h-5" />
              What is SHAP?
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              **SHAP (Shapley Additive exPlanations)** is a game theoretic approach to explain the output of any machine learning model.
              It connects optimal local feature attribution with classical cooperative game theory Shapley values.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              In game theory, players cooperate to receive a collective payout. SHAP treats each **sensor feature** as a "player" in a game, 
              where the "payout" is the prediction score. SHAP calculates the fair payout share that should be attributed to each sensor.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Info className="text-blue-400 w-5 h-5" />
              Clinical Significance
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              For artificial intelligence to be safely integrated into clinical diagnosis pipelines, black-box predictions are insufficient. 
              Physicians must understand **why** an AI model labeled a breath profile as diabetic.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              SHAP allows researchers to confirm that predictions are driven by authentic metabolic sensor spikes (like TGS826's sensitivity 
              to ammonia or TGS2602's sensitivity to VOCs) rather than background sensor noise or noise artifacts.
            </p>
          </div>
        </div>

        {/* Global SHAP Plots */}
        <div className="lg:col-span-2 space-y-6">
          {!trainResult ? (
            <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-gray-500">
                <EyeOff className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">No Trained Model Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto">
                  Execute the model training pipeline on the **Training** page first to generate global model explainability metrics.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feature Importance Table */}
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Layers className="text-purple-400 w-5 h-5" />
                  Global SHAP Feature Attribution
                </h2>
                <p className="text-xs text-gray-400">
                  Calculated by taking the average absolute SHAP values across all test cases. Features are ordered by global model impact.
                </p>
                <div className="space-y-3 pt-2">
                  {trainResult.shap_importance.map((item, idx) => (
                    <div key={item.feature} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-300">
                        <span>{idx + 1}. {item.feature}</span>
                        <span>{item.importance.toFixed(5)} mean(|SHAP|)</span>
                      </div>
                      <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ 
                            width: `${(item.importance / Math.max(...trainResult.shap_importance.map(x => x.importance))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beeswarm Plot */}
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="text-pink-400 w-5 h-5" />
                  SHAP Summary beeswarm (Diabetes positive class)
                </h2>
                <p className="text-xs text-gray-400">
                  Each dot represents a single test sample. Red points represent high values of that sensor feature, 
                  while blue represents low values. The horizontal axis indicates whether that value pushed the model 
                  towards a diabetic prediction (positive SHAP) or normal (negative SHAP).
                </p>
                <div className="border border-slate-800 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-3">
                  <img 
                    src={`data:image/png;base64,${trainResult.plots.shap_summary}`} 
                    alt="SHAP summary beeswarm plot" 
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
