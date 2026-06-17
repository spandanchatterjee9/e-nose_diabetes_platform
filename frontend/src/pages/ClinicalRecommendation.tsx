import React from "react";
import type { AssessmentResponse } from "../services/api";
import { ShieldCheck, Heart, Stethoscope, AlertTriangle } from "lucide-react";

interface ClinicalRecommendationProps {
  assessment: AssessmentResponse | null;
}

export const ClinicalRecommendation: React.FC<ClinicalRecommendationProps> = ({ assessment }) => {
  if (!assessment) {
    return (
      <div className="glass-panel p-10 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px] space-y-4 m-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">No Active Recommendations</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto">
            Please run a patient screening in **Patient Assessment** to generate clinical recommendations.
          </p>
        </div>
      </div>
    );
  }

  const { risk_category, clinical_recommendation, patient_info, prediction } = assessment;

  // Custom checklist items based on category
  const getWorkflowItems = (category: string) => {
    switch (category.toUpperCase()) {
      case "HIGH":
        return [
          "Urgent: Order a venous Fasting Blood Sugar (FBS) test.",
          "Urgent: Request a laboratory HbA1c screening.",
          "Schedule an endocrinology consultation within 5 working days.",
          "Counsel patient on acute hyperglycemia symptoms.",
          "Review cardiovascular parameters and renal function indices."
        ];
      case "MODERATE":
        return [
          "Order standard Oral Glucose Tolerance Test (OGTT).",
          "Follow up with patient in 3 months for a screening review.",
          "Refer to a dietitian for carbohydrate/lipid mapping.",
          "Promote regular aerobic exercise (150 minutes/week).",
          "Recommend at-home self-monitoring of blood glucose (SMBG)."
        ];
      default:
        return [
          "Encourage regular physical exercise (30 mins daily).",
          "Maintain balanced diet low in refined sugars.",
          "Conduct routine annual physical screening.",
          "Re-assess breath biomarkers in 12 months.",
          "Encourage high fiber and complex carbohydrate intake."
        ];
    }
  };

  const checklist = getWorkflowItems(risk_category);

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Clinical Guidance & Recommendations
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Automated clinical action checklists and lifestyle instructions based on patient's risk category.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Recommendation box */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            {risk_category === "High" ? (
              <AlertTriangle className="text-red-400 w-5 h-5" />
            ) : risk_category === "Moderate" ? (
              <AlertTriangle className="text-amber-400 w-5 h-5" />
            ) : (
              <ShieldCheck className="text-green-400 w-5 h-5" />
            )}
            Diagnostic Outcome: {risk_category.toUpperCase()} RISK
          </h2>

          <div className={`p-5 rounded-xl border text-xs leading-relaxed space-y-3 ${
            risk_category === "High"
              ? "bg-red-500/10 border-red-500/20 text-red-300"
              : risk_category === "Moderate"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-green-500/10 border-green-500/20 text-green-300"
          }`}>
            <span className="font-bold uppercase block text-white text-[10px] tracking-wider">
              Clinical Action Directive
            </span>
            <p className="text-sm font-medium leading-relaxed">
              {clinical_recommendation}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Recommended Clinical Protocol Checklist
            </h3>
            
            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900/40 border border-slate-800/40 p-3 rounded-lg text-xs">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-purple-500 bg-slate-950 border-slate-800 focus:ring-0 accent-purple-500"
                  />
                  <span className="text-slate-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Summary info */}
        <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-md flex items-center gap-2">
              <Heart className="text-pink-400 w-5 h-5" />
              Patient Health Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-bold">{patient_info.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="text-white">{patient_info.age} / {patient_info.gender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Calculated BMI:</span>
                <span className="text-white font-bold font-mono">{assessment.bmi.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Classification:</span>
                <span className="text-white">{prediction}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg text-[10px] text-slate-500 leading-normal">
            <b>Important Notice:</b> Clinical recommendations are generated automatically based on standard endocrinology screening thresholds and are meant to assist clinical reasoning.
          </div>
        </div>
      </div>
    </div>
  );
};
