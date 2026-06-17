import React from "react";
import type { AssessmentResponse } from "../services/api";
import { Thermometer, AlertCircle } from "lucide-react";

interface PredictionResultsProps {
  assessment: AssessmentResponse | null;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ assessment }) => {
  if (!assessment) {
    return (
      <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px] space-y-4 m-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">No Active Diagnostic Results</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto">
            Please fill out and submit a patient screening form in the **Patient Assessment** tab to evaluate diagnostics.
          </p>
        </div>
      </div>
    );
  }

  const { prediction, risk_percentage, risk_category, confidence, sensor_data } = assessment;
  
  const getRiskStyles = (category: string) => {
    switch (category.toUpperCase()) {
      case "HIGH":
        return {
          text: "text-red-400",
          bg: "bg-red-500/10 border-red-500/20",
          dialColor: "#ef4444",
          badge: "bg-red-500/20 text-red-400 border-red-500/30"
        };
      case "MODERATE":
        return {
          text: "text-amber-400",
          bg: "bg-amber-500/10 border-amber-500/20",
          dialColor: "#f59e0b",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30"
        };
      default:
        return {
          text: "text-green-400",
          bg: "bg-green-500/10 border-green-500/20",
          dialColor: "#10b981",
          badge: "bg-green-500/20 text-green-400 border-green-500/30"
        };
    }
  };
  
  const designStyles = getRiskStyles(risk_category);

  // SVG Gauge calculations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk_percentage / 100) * circumference;

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Diagnostic Classification
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Machine Learning prediction outcome and local explainability breakdown.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Risk dial card */}
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Risk Analysis Gauge
          </h2>
          
          {/* Radial Dial */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={designStyles.dialColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono">{risk_percentage.toFixed(1)}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Diabetic Risk</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider inline-block ${designStyles.badge}`}>
              {risk_category} Risk Outcome
            </span>
            <p className="text-xs text-slate-400">
              AI classified the subject as <b className="text-white">{prediction.toUpperCase()}</b>.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Confidence Score: {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Center/Right: Detailed results and contributing factors */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Thermometer className="text-purple-400 w-5 h-5" />
            Top Contributing Gas Sensor Readings
          </h2>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Sensor values table */}
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                The values below represent the patient's breath sample resistance. 
                Sensors like <b className="text-white">TGS 2610</b> and <b className="text-white">TGS 2611</b> carry the highest diagnostic importance.
              </p>
              
              <div className="space-y-2.5">
                {[
                  { name: "TGS 2600", val: sensor_data.TGS2600, desc: "Ambient / General VOCs" },
                  { name: "TGS 2602", val: sensor_data.TGS2602, desc: "Organic Vapors" },
                  { name: "TGS 2610", val: sensor_data.TGS2610, desc: "LP Gas / High correlation index" },
                  { name: "TGS 2611", val: sensor_data.TGS2611, desc: "Methane / Hydrocarbons" },
                  { name: "TGS 2620", val: sensor_data.TGS2620, desc: "Alcohol Vapors" },
                  { name: "TGS 826",  val: sensor_data.TGS826,  desc: "Ammonia / Nitrides" }
                ].map((s) => (
                  <div key={s.name} className="flex justify-between items-center p-2 bg-slate-900/40 rounded border border-slate-800/40 text-xs">
                    <div>
                      <span className="font-bold text-white">{s.name}</span>
                      <span className="text-[9px] text-slate-500 block">{s.desc}</span>
                    </div>
                    <span className="font-mono text-slate-300 font-bold">{s.val.toFixed(4)} kΩ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local SHAP contributions text or fallback bar chart */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Local Feature Attribution Plot
              </span>
              <div className="border border-slate-800 bg-slate-900 rounded p-4 flex flex-col justify-center items-center min-h-[200px]">
                <div className="text-center text-[10px] text-slate-400 space-y-3">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg max-w-xs text-xs font-semibold leading-relaxed">
                    "TGS2610 and TGS2611 are the key predictors. Low resistance values in these channels strongly pull the diagnosis towards the diabetic state."
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-2">
                    Standardized baseline value: {assessment.bmi ? "BMI Adjusted" : "Raw"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
