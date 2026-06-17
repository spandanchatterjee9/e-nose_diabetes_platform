import React from "react";
import { Activity, Cpu, Award, GitMerge, Sliders, Eye } from "lucide-react";

export const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-12">
      {/* Background glow effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-glow-purple rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-glow-blue rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider text-purple-400 uppercase rounded-full bg-purple-950/45 border border-purple-800/35">
          Research Prototype
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-none">
          Non-Invasive Diabetes Detection
          <span className="block text-gradient mt-2 font-extrabold">via Electronic Nose (E-Nose)</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-3xl">
          An extensible, production-grade AI research platform utilizing metal oxide semiconductor gas sensors (TGS series) 
          and advanced machine learning to analyze human exhaled breath fingerprints for non-invasive diabetic screening.
        </p>
      </div>

      {/* Overview Card */}
      <div className="glass-panel p-8 rounded-2xl max-w-5xl space-y-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Activity className="text-purple-400 w-6 h-6 animate-pulse" />
          The Science of E-Nose Breath Analysis
        </h2>
        <div className="grid md:grid-cols-2 gap-8 text-gray-300 leading-relaxed text-sm">
          <p>
            Traditional diabetes diagnostic methods (blood glucose, HbA1c tests) require invasive blood draws, 
            causing patient discomfort and carrying risks of infection. Scientific studies have shown that 
            individuals with diabetes excrete unique chemical concentrations in their breath, specifically elevated 
            volatile organic compounds (VOCs) such as acetone, caused by altered metabolic processes.
          </p>
          <p>
            An **Electronic Nose (E-Nose)** mimics the human olfactory system using an array of chemical gas sensors. 
            When exposed to exhaled breath, the sensor resistances change depending on the gas mixture composition. 
            This platform extracts these complex sensor response fingerprints to classify diabetes risk non-invasively, 
            optimized with hyperparameter search, full experiment auditability, and SHAP explainability.
          </p>
        </div>
      </div>

      {/* Core Research Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Core Research Features</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Optuna Tuning</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automates hyperparameter exploration using Bayesian Optimization, seeking optimal Random Forest parameters.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Explainable AI</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Implements SHAP (Shapley Additive exPlanations) to explain feature contributions for both global models and local patient assessments.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Model Abstraction</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Features a modular BaseModel abstraction allowing painless hot-swaps of baseline models with XGBoost, LightGBM, or custom CNN architectures.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Experiment Tracking</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Integrates MLflow to audit and track training runs, parameters, metrics (Accuracy, ROC-AUC, F1), and resulting visualization charts.
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Specifications */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="text-pink-400 w-6 h-6" />
          MOS Sensor Configuration Spec
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          {[
            { name: "TGS2600", target: "Hydrogen, Carbon Monoxide", desc: "High sensitivity to air contaminants, particularly hydrogen and carbon monoxide." },
            { name: "TGS2602", target: "Ammonia, Hydrogen Sulfide", desc: "Optimized for detecting volatile organic compounds and odorous organic gases." },
            { name: "TGS2610", target: "LP Gas, Butane", desc: "High sensitivity to combustible hydrocarbons such as butane and propane." },
            { name: "TGS2611", target: "Methane, Natural Gas", desc: "Designed with an internal filter to suppress interference, highly specific to methane." },
            { name: "TGS2620", target: "Solvent Vapors, Alcohol", desc: "Sensitive to organic solvent vapors, alcohol, and volatile gases." },
            { name: "TGS826", target: "Ammonia gas", desc: "Specialized ceramic semiconductor sensor with peak sensitivity for ammonia vapor." },
          ].map((sensor) => (
            <div key={sensor.name} className="glass-panel p-5 rounded-xl border-l-4 border-l-purple-500 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-md">{sensor.name}</span>
                <span className="text-[10px] bg-slate-800 text-purple-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Target: {sensor.target}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{sensor.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
