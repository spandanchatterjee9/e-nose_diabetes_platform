const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface FeatureStats {
  feature: string;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

export interface ClassDistItem {
  name: string;
  value: number;
}

export interface DatasetStats {
  total_samples: number;
  class_distribution: ClassDistItem[];
  feature_stats: FeatureStats[];
  correlation_matrix: number[][];
  features: string[];
}

export interface TrainResponse {
  run_id: string;
  best_params: Record<string, any>;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  plots: {
    confusion_matrix: string;
    roc_curve: string;
    pr_curve: string;
    feature_importance: string;
    shap_summary: string;
  };
  shap_importance: {
    feature: string;
    importance: number;
  }[];
  trial_history: {
    trial: number;
    value: number;
    params: Record<string, any>;
  }[];
}

export interface SensorInputs {
  TGS2600: number;
  TGS2602: number;
  TGS2610: number;
  TGS2611: number;
  TGS2620: number;
  TGS826: number;
}

export interface FeatureContribution {
  feature: string;
  raw_value: number;
  shap_value: number;
  direction: string;
}

export interface PredictionResponse {
  prediction: string;
  class_index: number;
  confidence: number;
  expected_value: number;
  contributions: FeatureContribution[];
  waterfall_plot: string;
  human_readable?: string;
}

export interface PatientInfo {
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
}

export interface PatientAssessmentRequest {
  patient_info: PatientInfo;
  sensor_data: SensorInputs;
}

export interface AssessmentResponse {
  assessment_id: string;
  patient_info: PatientInfo;
  bmi: number;
  sensor_data: SensorInputs;
  prediction: string;
  confidence: number;
  risk_percentage: number;
  risk_category: string;
  clinical_recommendation: string;
  timestamp: string;
  model_version: string;
}

export interface ExperimentRun {
  run_id: string;
  status: string;
  start_time: string;
  parameters: Record<string, any>;
  metrics: Record<string, number>;
}

export const api = {
  async getDatasetStats(): Promise<DatasetStats> {
    const res = await fetch(`${API_BASE_URL}/api/dataset/stats`);
    if (!res.ok) throw new Error("Failed to fetch dataset stats");
    return res.json();
  },

  async trainModel(modelName: string = "random_forest", runTuning: boolean = true, nTrials: number = 15): Promise<TrainResponse> {
    const res = await fetch(`${API_BASE_URL}/api/model/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_name: modelName, run_tuning: runTuning, n_trials: nTrials }),
    });
    if (!res.ok) throw new Error("Failed to execute model training");
    return res.json();
  },

  async predictDiabetes(inputs: SensorInputs): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to generate prediction");
    }
    return res.json();
  },

  async createAssessment(assessment: PatientAssessmentRequest): Promise<AssessmentResponse> {
    const res = await fetch(`${API_BASE_URL}/api/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to submit patient assessment");
    }
    return res.json();
  },

  async getAssessments(limit: number = 10): Promise<AssessmentResponse[]> {
    const res = await fetch(`${API_BASE_URL}/api/assessments?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch assessments history");
    return res.json();
  },

  async getExperiments(): Promise<ExperimentRun[]> {
    const res = await fetch(`${API_BASE_URL}/api/model/experiments`);
    if (!res.ok) throw new Error("Failed to fetch experiment log");
    return res.json();
  },

  getReportDownloadUrl(assessmentId: string): string {
    return `${API_BASE_URL}/api/assessment/report/${assessmentId}`;
  }
};
