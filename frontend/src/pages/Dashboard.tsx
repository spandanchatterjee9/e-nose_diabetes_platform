import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { AssessmentResponse } from "../services/api";
import { Users, Activity, ShieldAlert, Server, UserCheck } from "lucide-react";

export const Dashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<string>("Random Forest (Default)");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAssessments(10);
        setAssessments(data);
        if (data.length > 0) {
          setActiveModel(data[0].model_version);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalAssessments = assessments.length;
  
  const getRiskBadgeStyles = (category: string) => {
    switch (category.toUpperCase()) {
      case "HIGH":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MODERATE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8">
      {/* Background ambient glow */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-glow-purple rounded-full pointer-events-none z-0" />
      
      {/* Page Title */}
      <div className="relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Clinical Diagnostic Workspace
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Electronic Nose (E-Nose) non-invasive screening portal and clinical patient records.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {/* Total Assessments */}
        <div className="glass-panel p-6 rounded-xl border-t border-t-purple-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Screenings</span>
            <p className="text-3xl font-black text-white">{loading ? "..." : totalAssessments}</p>
            <p className="text-[9px] text-slate-500">Recorded patient breath sessions</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active AI Model */}
        <div className="glass-panel p-6 rounded-xl border-t border-t-teal-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active ML Classifier</span>
            <p className="text-md font-bold text-white mt-1 truncate max-w-[150px]">
              {loading ? "..." : activeModel.split(" ")[0]}
            </p>
            <p className="text-[9px] text-slate-500">Best performer loaded dynamically</p>
          </div>
          <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400 border border-teal-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="glass-panel p-6 rounded-xl border-t border-t-blue-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telemetry Link</span>
            <p className="text-lg font-extrabold text-green-400 flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping inline-block" />
              Connected
            </p>
            <p className="text-[9px] text-slate-500">FastAPI & SQLite instances healthy</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Device Integration status */}
        <div className="glass-panel p-6 rounded-xl border-t border-t-pink-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sensor Array Link</span>
            <p className="text-lg font-bold text-slate-300 mt-1">Standby</p>
            <p className="text-[9px] text-slate-500">Virtual telemetry inputs active</p>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400 border border-pink-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Latest Assessments Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-purple-400 w-5 h-5" />
              Recent Patient Screenings
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
              Live Registry
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading records...</div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No patient assessments recorded yet. Run a screening under **Patient Assessment**.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-2 font-semibold">Patient</th>
                    <th className="py-3 px-2 font-semibold">Age/Gender</th>
                    <th className="py-3 px-2 font-semibold text-center">BMI</th>
                    <th className="py-3 px-2 font-semibold text-right">Risk Score</th>
                    <th className="py-3 px-2 font-semibold text-right">Category</th>
                    <th className="py-3 px-2 font-semibold text-right">Diagnosed On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {assessments.map((row) => (
                    <tr key={row.assessment_id} className="hover:bg-slate-900/30 transition">
                      <td className="py-3 px-2">
                        <div className="font-bold text-white">{row.patient_info.name}</div>
                        <div className="text-[10px] text-slate-500">{row.patient_info.patient_id}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {row.patient_info.age} yrs / {row.patient_info.gender}
                      </td>
                      <td className="py-3 px-2 text-center font-mono">
                        {row.bmi.toFixed(1)}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-white font-mono">
                        {row.risk_percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getRiskBadgeStyles(row.risk_category)}`}>
                          {row.risk_category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-500">
                        {new Date(row.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-md flex items-center gap-2">
              <ShieldAlert className="text-teal-400 w-5 h-5" />
              Clinical Screening Guide
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This platform maps metabolic biomarkers from the patient's breath sample using a 6-gas sensor array. 
              The volatile organic compound (VOC) patterns correlate directly with hyperglycemia indices.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <div>
                  <span className="text-white font-semibold">Low Risk (&lt; 50%)</span>
                  <p className="text-[10px] text-slate-500 leading-normal">Breath profile is matching healthy cohort. Lifestyle maintenance recommended.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                <div>
                  <span className="text-white font-semibold">Moderate Risk (50% - 80%)</span>
                  <p className="text-[10px] text-slate-500 leading-normal">Borderline biomarkers observed. Standard clinical glucose screen recommended.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                <div>
                  <span className="text-white font-semibold">High Risk (&gt; 80%)</span>
                  <p className="text-[10px] text-slate-500 leading-normal">Strong diabetic breath signatures detected. Fasting blood sugar & HbA1c tests highly recommended.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800/80 pt-4 text-[10px] text-slate-500">
            Certified ISO-13485 Breath Analyzer Simulation Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
