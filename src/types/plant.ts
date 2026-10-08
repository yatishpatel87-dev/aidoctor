export type Language = 'gu' | 'en' | 'hi';

export type HealthStatus = 'healthy' | 'attention' | 'moderate' | 'critical';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type NutrientStatus = 'normal' | 'deficiency' | 'uncertain';

export interface VisualSymptom {
  symptom: string;
  is_visible_fact: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface DiseaseDetection {
  name: string;
  probability: number;
  symptoms: string[];
  why_suspected: string;
  severity: 'mild' | 'moderate' | 'severe';
  recommended_action: string;
  disclaimer?: string;
}

export interface PestDetection {
  name: string;
  probability: number;
  visible_evidence: string;
  damage_symptoms: string[];
  management: string[];
}

export interface NutrientItem {
  nutrient: string;
  status: NutrientStatus;
  explanation: string;
}

export interface TreatmentPlan {
  immediate_actions: string[];
  organic_remedies: string[];
  prevention: string[];
}

export interface CareCalendarItem {
  day: number;
  task: string;
  type: 'water' | 'fertilizer' | 'sun' | 'prune' | 'check';
  description?: string;
}

export interface PlantAnalysisResult {
  plant: {
    name_gu: string;
    name_en: string;
    scientific_name: string;
    category: string;
    confidence: number;
    is_possible_only?: boolean;
  };
  health: {
    score: number;
    status: HealthStatus;
    status_text: string;
    confidence: ConfidenceLevel;
    summary: string;
  };
  visual_symptoms: VisualSymptom[];
  possible_diseases: DiseaseDetection[];
  possible_pests: PestDetection[];
  nutrient_issues: NutrientItem[];
  watering: {
    advice: string;
    current_risk: 'normal' | 'underwatering' | 'overwatering' | 'uncertain';
    frequency_suggestion: string;
    check_advice: string;
  };
  sunlight: {
    requirement: string;
    hours_per_day: string;
    advice: string;
  };
  soil: {
    preferred_type: string;
    drainage: string;
    ph_range: string;
    organic_matter: string;
    note: string;
  };
  fertilizer: {
    organic_compost: string;
    vermicompost: string;
    general_npk: string;
    precautions: string[];
  };
  treatment: TreatmentPlan;
  doctor_explanation: {
    why_diagnosed: string;
    visual_clues: string[];
    uncertainty_notes: string;
  };
  confidence_level: ConfidenceLevel;
  doctor_note: string;
  care_calendar_preview: CareCalendarItem[];
  comparison_note?: string;
}

export interface ScanRecord {
  id: string;
  plantId?: string;
  timestamp: number;
  dateFormatted: string;
  images: string[];
  analysis: PlantAnalysisResult;
  notes?: string;
}

export interface PlantProfile {
  id: string;
  name: string;
  nickname?: string;
  species: string;
  category: string;
  coverImage: string;
  createdAt: number;
  location: 'balcony' | 'garden' | 'indoor' | 'farm' | 'other';
  latestHealthScore: number;
  lastScanDate: string;
  scansCount: number;
  notes: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  audioBase64?: string;
}

export type TaskType = 'water' | 'fertilizer' | 'sun' | 'prune' | 'check' | 'spray';

export interface PlantCareReminder {
  id: string;
  plantId: string;
  plantName: string;
  plantImage?: string;
  taskType: TaskType;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm, e.g. "08:00"
  frequencyDays: number;
  lastCompletedDate?: string;
  isCompletedToday: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface NotificationSettings {
  browserNotificationsEnabled: boolean;
  morningReminderTime: string;
  eveningReminderTime: string;
  soundEnabled: boolean;
  lastNotifiedDate?: string;
}
