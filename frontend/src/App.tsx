import React, { useState } from "react";
import { Dashboard as DashboardPage } from "./pages/Dashboard";
import { Assessment as AssessmentPage } from "./pages/Assessment";
import { PredictionResults as PredictionResultsPage } from "./pages/PredictionResults";
import { ClinicalRecommendation as ClinicalRecommendationPage } from "./pages/ClinicalRecommendation";
import { Reports as ReportsPage } from "./pages/Reports";
import { ResearchMode as ResearchModePage } from "./pages/ResearchMode";
import type { TrainResponse, AssessmentResponse } from "./services/api";

import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  FileText, 
  Cpu, 
  Menu, 
  X 
} from "lucide-react";
import "./App.css";

type TabId = "dashboard" | "assessment" | "results" | "recommendations" | "reports" | "research";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Model training result (propagates to SHAP and benchmark sheets)
  const [trainResult, setTrainResult] = useState<TrainResponse | null>(null);
  
  // Latest patient screening result (auto-navigates on diagnosis)
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResponse | null>(null);

  const handleTrainSuccess = (res: TrainResponse) => {
    setTrainResult(res);
  };

  const handleAssessmentComplete = (res: AssessmentResponse) => {
    setLatestAssessment(res);
    setActiveTab("results"); // Navigate directly to predictions results page
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assessment", label: "Patient Assessment", icon: Activity },
    { id: "results", label: "Prediction Results", icon: ShieldAlert },
    { id: "recommendations", label: "Recommendations", icon: Stethoscope },
    { id: "reports", label: "Reports Logs", icon: FileText },
    { id: "research", label: "Research Mode (Admin)", icon: Cpu },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "assessment":
        return <AssessmentPage onAssessmentComplete={handleAssessmentComplete} />;
      case "results":
        return <PredictionResultsPage assessment={latestAssessment} />;
      case "recommendations":
        return <ClinicalRecommendationPage assessment={latestAssessment} />;
      case "reports":
        return <ReportsPage latestAssessment={latestAssessment} />;
      case "research":
        return (
          <div className="w-full">
            <ResearchModePage trainResult={trainResult} onTrainSuccess={handleTrainSuccess} />
            <TrainingStateSync onTrain={handleTrainSuccess} />
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background glow meshes */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-glow-purple rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-glow-blue rounded-full pointer-events-none z-0" />

      {/* Mobile Header */}
      <header className="lg:hidden w-full h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md fixed top-0 left-0 flex items-center justify-between px-6 z-50">
        <span className="font-bold text-white text-md tracking-wider uppercase text-gradient">E-Nose Clinical</span>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`w-64 flex-shrink-0 border-r border-slate-800/60 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between fixed lg:static top-0 bottom-0 left-0 z-40 transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col space-y-6 pt-20 lg:pt-8 px-4">
          <div className="px-4 py-2 border-b border-slate-800/40 pb-4">
            <h2 className="font-extrabold text-lg text-white tracking-wide uppercase text-gradient">E-Nose Platform</h2>
            <span className="text-[10px] text-gray-500 font-medium block mt-1">CLINICAL EDITION v2.0</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSidebarOpen(false);
                    setActiveTab(item.id as TabId);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === item.id 
                      ? "bg-purple-600/20 text-purple-400 border-l-4 border-l-purple-500 font-bold" 
                      : "text-gray-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-6 border-t border-slate-800/40 text-[10px] text-gray-500 space-y-1">
          <p>© 2026 DeepMind Pair Programming</p>
          <p>AI Healthcare Diagnostics</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 z-10 w-full">
        {renderContent()}
      </main>
    </div>
  );
};

// Sub-component to dynamically sync and intercept Training status changes inside Research sub-tabs
interface SyncProps {
  onTrain: (res: TrainResponse) => void;
}
const TrainingStateSync: React.FC<SyncProps> = ({ onTrain }) => {
  React.useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (args[0] && typeof args[0] === 'string' && args[0].endsWith('/api/model/train')) {
        const clonedRes = res.clone();
        clonedRes.json().then(data => {
          if (data && data.metrics) {
            onTrain(data);
          }
        }).catch(() => {});
      }
      return res;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [onTrain]);

  return null;
};

export default App;
