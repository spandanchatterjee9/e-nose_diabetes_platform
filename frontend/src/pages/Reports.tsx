import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { AssessmentResponse } from "../services/api";
import { FileText, Download, CheckCircle, Search } from "lucide-react";

interface ReportsProps {
  latestAssessment: AssessmentResponse | null;
}

export const Reports: React.FC<ReportsProps> = ({ latestAssessment }) => {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchAssessments = async () => {
    try {
      const data = await api.getAssessments(30);
      setAssessments(data);
    } catch (err) {
      console.error("Failed to load assessments history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [latestAssessment]);

  const handleDownload = (id: string) => {
    window.open(api.getReportDownloadUrl(id), "_blank");
  };

  const getRiskColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "HIGH":
        return "text-red-400 font-bold";
      case "MODERATE":
        return "text-amber-400 font-bold";
      default:
        return "text-green-400 font-bold";
    }
  };

  const filteredAssessments = assessments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.patient_info.name.toLowerCase().includes(q) ||
      item.patient_info.patient_id.toLowerCase().includes(q) ||
      item.assessment_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Diagnostic Audit Reports
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review screening history logs and download custom PDF diagnostic clinical assessments.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: History & PDF downloads */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="text-purple-400 w-5 h-5" />
              Patient Assessment Records
            </h2>
            
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient, ID, record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading logs...</div>
          ) : filteredAssessments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching records found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssessments.map((item) => (
                <div key={item.assessment_id} className="flex justify-between items-center bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl hover:border-slate-700/60 transition gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">{item.patient_info.name}</div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>ID: {item.patient_info.patient_id}</span>
                        <span>•</span>
                        <span>Ref: {item.assessment_id}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right text-xs">
                      <div className={getRiskColor(item.risk_category)}>
                        {item.risk_category.toUpperCase()} RISK ({item.risk_percentage.toFixed(1)}%)
                      </div>
                      <div className="text-[9px] text-slate-500">{item.prediction} Diagnosis</div>
                    </div>
                    
                    <button
                      onClick={() => handleDownload(item.assessment_id)}
                      className="p-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-600 hover:text-white transition flex items-center justify-center"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Informational overview */}
        <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-md flex items-center gap-2">
              <CheckCircle className="text-teal-400 w-5 h-5" />
              Report Specifications
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clinical diagnostic reports are compiled using standard PDF protocols containing:
            </p>

            <ul className="space-y-2 text-xs text-slate-300 pl-4 list-disc">
              <li>Patient demographics (including calculated BMI status)</li>
              <li>MOS sensor array telemetry signals</li>
              <li>Classifier outcomes and percentage risk factors</li>
              <li>Risk category (Low, Moderate, High)</li>
              <li>Guidance directives and medical recommended actions</li>
              <li>Model class and run versions for validation audits</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg text-[10px] text-slate-500">
            For security, patient reports are compiled dynamically on-demand and pull directly from local SQLite registers.
          </div>
        </div>
      </div>
    </div>
  );
};
