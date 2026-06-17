import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { PatientAssessmentRequest, AssessmentResponse } from "../services/api";
import { User, ShieldCheck, Wind, AlertCircle } from "lucide-react";

interface AssessmentProps {
  onAssessmentComplete: (assessment: AssessmentResponse) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ onAssessmentComplete }) => {
  const [patientId, setPatientId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<string>("Male");
  const [height, setHeight] = useState<number>(1.75);
  const [weight, setWeight] = useState<number>(75.0);
  const [bmi, setBmi] = useState<number>(24.49);
  
  // Sensor fields
  const [tgs2600, setTgs2600] = useState<number>(25.0);
  const [tgs2602, setTgs2602] = useState<number>(55.0);
  const [tgs2610, setTgs2610] = useState<number>(20.0);
  const [tgs2611, setTgs2611] = useState<number>(12.0);
  const [tgs2620, setTgs2620] = useState<number>(25.0);
  const [tgs826, setTgs826] = useState<number>(28.0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate patient ID on mount
  useEffect(() => {
    const randomId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatientId(randomId);
  }, []);

  // Recalculate BMI dynamically
  useEffect(() => {
    if (height > 0) {
      const calculatedBmi = weight / (height * height);
      setBmi(calculatedBmi);
    } else {
      setBmi(0);
    }
  }, [height, weight]);

  // Breath presets for demonstration
  const applyPreset = (type: "diabetic" | "normal" | "clear") => {
    if (type === "diabetic") {
      setTgs2600(23.65);
      setTgs2602(58.33);
      setTgs2610(15.02);
      setTgs2611(10.16);
      setTgs2620(24.50);
      setTgs826(30.04);
    } else if (type === "normal") {
      setTgs2600(28.76);
      setTgs2602(58.67);
      setTgs2610(34.04);
      setTgs2611(16.05);
      setTgs2620(32.01);
      setTgs826(29.84);
    } else {
      setTgs2600(35.2);
      setTgs2602(75.4);
      setTgs2610(44.1);
      setTgs2611(18.5);
      setTgs2620(41.2);
      setTgs826(38.0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: PatientAssessmentRequest = {
      patient_info: {
        patient_id: patientId,
        name,
        age,
        gender,
        height,
        weight,
      },
      sensor_data: {
        TGS2600: tgs2600,
        TGS2602: tgs2602,
        TGS2610: tgs2610,
        TGS2611: tgs2611,
        TGS2620: tgs2620,
        TGS826: tgs826,
      },
    };

    try {
      const response = await api.createAssessment(payload);
      onAssessmentComplete(response);
    } catch (err: any) {
      setError(err.message || "Failed to submit patient assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Patient Diagnostic Screening
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform a non-invasive screening using virtual E-Nose sensors.
        </p>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-red-500 bg-red-950/20 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Patient Demographics */}
        <div className="glass-panel p-6 rounded-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="text-purple-400 w-5 h-5" />
            1. Patient Demographics
          </h2>

          <div className="space-y-4">
            {/* ID */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Patient Record ID
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Height */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Height (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              {/* Weight */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            {/* BMI Display */}
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Calculated BMI</span>
                <span className="text-xl font-black text-white">{bmi.toFixed(2)}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                bmi < 18.5 
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : bmi < 25
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : bmi < 30
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal Weight" : bmi < 30 ? "Overweight" : "Obese"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Sensor Inputs */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-800 pb-3 gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wind className="text-teal-400 w-5 h-5" />
              2. Sensor Array Telemetry Channels (MOS resistance kΩ)
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => applyPreset("diabetic")}
                className="bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2.5 py-1 text-[10px] font-bold hover:bg-red-500/20 transition"
              >
                Diabetic Preset
              </button>
              <button
                type="button"
                onClick={() => applyPreset("normal")}
                className="bg-green-500/10 text-green-400 border border-green-500/20 rounded px-2.5 py-1 text-[10px] font-bold hover:bg-green-500/20 transition"
              >
                Normal Preset
              </button>
              <button
                type="button"
                onClick={() => applyPreset("clear")}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2.5 py-1 text-[10px] font-bold hover:bg-slate-750 transition"
              >
                Clear Air Preset
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {/* TGS2600 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 2600 (Air Pollutants)</span>
                <span className="text-slate-400 font-mono">{tgs2600.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="50"
                step="0.01"
                value={tgs2600}
                onChange={(e) => setTgs2600(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>

            {/* TGS2602 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 2602 (Organic Vapors)</span>
                <span className="text-slate-400 font-mono">{tgs2602.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="120"
                step="0.01"
                value={tgs2602}
                onChange={(e) => setTgs2602(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>

            {/* TGS2610 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 2610 (Butane / LP Gas)</span>
                <span className="text-slate-400 font-mono">{tgs2610.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="60"
                step="0.01"
                value={tgs2610}
                onChange={(e) => setTgs2610(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>

            {/* TGS2611 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 2611 (Methane / Natural Gas)</span>
                <span className="text-slate-400 font-mono">{tgs2611.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="25"
                step="0.01"
                value={tgs2611}
                onChange={(e) => setTgs2611(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>

            {/* TGS2620 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 2620 (Alcohol / Solvents)</span>
                <span className="text-slate-400 font-mono">{tgs2620.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="60"
                step="0.01"
                value={tgs2620}
                onChange={(e) => setTgs2620(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>

            {/* TGS826 */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-300 font-bold">TGS 826 (Ammonia)</span>
                <span className="text-slate-400 font-mono">{tgs826.toFixed(2)} kΩ</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="60"
                step="0.01"
                value={tgs826}
                onChange={(e) => setTgs826(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-900 rounded"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white border border-purple-500 rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? "Analyzing..." : "Diagnose & Save Assessment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
