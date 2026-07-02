// Core domain types for the Endo Tracker "health brain".
// Kept deliberately structured (rather than free text) so that future
// AI analysis can reason over consistent fields.

export type PainLocation =
  | 'pelvis-center'
  | 'pelvis-left'
  | 'pelvis-right'
  | 'lower-back'
  | 'legs'
  | 'abdomen'
  | 'rectal'
  | 'during-sex'
  | 'ovulation'
  | 'other';

export const PAIN_LOCATIONS: { id: PainLocation; label: string }[] = [
  { id: 'pelvis-center', label: 'Pelvis (center)' },
  { id: 'pelvis-left', label: 'Pelvis (left)' },
  { id: 'pelvis-right', label: 'Pelvis (right)' },
  { id: 'lower-back', label: 'Lower back' },
  { id: 'legs', label: 'Legs / hips' },
  { id: 'abdomen', label: 'Abdomen / stomach' },
  { id: 'rectal', label: 'Rectal' },
  { id: 'during-sex', label: 'During / after sex' },
  { id: 'ovulation', label: 'Ovulation pain' },
  { id: 'other', label: 'Other' },
];

export type SymptomCategory =
  | 'pain'
  | 'digestive'
  | 'urinary'
  | 'energy-cognitive'
  | 'mood'
  | 'other';

export interface SymptomDefinition {
  id: string;
  label: string;
  category: SymptomCategory;
}

// Standard catalog of symptoms commonly tracked for endometriosis.
export const SYMPTOM_CATALOG: SymptomDefinition[] = [
  { id: 'cramping', label: 'Cramping', category: 'pain' },
  { id: 'bloating', label: 'Bloating ("endo belly")', category: 'digestive' },
  { id: 'nausea', label: 'Nausea', category: 'digestive' },
  { id: 'vomiting', label: 'Vomiting', category: 'digestive' },
  { id: 'diarrhea', label: 'Diarrhea', category: 'digestive' },
  { id: 'constipation', label: 'Constipation', category: 'digestive' },
  { id: 'painful-bowel-movements', label: 'Painful bowel movements', category: 'digestive' },
  { id: 'painful-urination', label: 'Painful urination', category: 'urinary' },
  { id: 'frequent-urination', label: 'Frequent urination', category: 'urinary' },
  { id: 'fatigue', label: 'Fatigue / exhaustion', category: 'energy-cognitive' },
  { id: 'brain-fog', label: 'Brain fog', category: 'energy-cognitive' },
  { id: 'dizziness', label: 'Dizziness', category: 'energy-cognitive' },
  { id: 'headache', label: 'Headache / migraine', category: 'energy-cognitive' },
  { id: 'joint-pain', label: 'Joint / muscle pain', category: 'pain' },
  { id: 'mood-swings', label: 'Mood swings', category: 'mood' },
  { id: 'anxiety', label: 'Anxiety', category: 'mood' },
  { id: 'low-mood', label: 'Low mood', category: 'mood' },
  { id: 'insomnia', label: 'Trouble sleeping', category: 'other' },
  { id: 'hot-flashes', label: 'Hot flashes', category: 'other' },
  { id: 'spotting', label: 'Spotting (outside period)', category: 'other' },
];

// 0 = none, 1 = mild, 2 = moderate, 3 = severe
export type SeverityLevel = 0 | 1 | 2 | 3;

export interface DailyLog {
  id?: number;
  /** ISO date string, YYYY-MM-DD. One entry per day (unique). */
  date: string;
  overallPainLevel: number; // 0-10
  painLocations: PainLocation[];
  symptoms: Partial<Record<string, SeverityLevel>>; // keyed by SymptomDefinition.id
  moodRating?: number; // 1-5
  energyLevel?: number; // 0-10
  sleepQuality?: number; // 0-10
  medicationsTaken: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

export interface CycleDay {
  id?: number;
  /** ISO date string, YYYY-MM-DD. Unique. */
  date: string;
  flow: FlowIntensity;
  isPeriodStart?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodTestResult {
  id?: number;
  date: string; // ISO date
  testName: string;
  value: number | string;
  unit?: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  orderedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType =
  | 'gp'
  | 'gynaecologist'
  | 'specialist'
  | 'surgery'
  | 'scan-ultrasound'
  | 'scan-mri'
  | 'physiotherapy'
  | 'mental-health'
  | 'other';

export const APPOINTMENT_TYPES: { id: AppointmentType; label: string }[] = [
  { id: 'gp', label: 'GP / Primary care' },
  { id: 'gynaecologist', label: 'Gynaecologist' },
  { id: 'specialist', label: 'Specialist' },
  { id: 'surgery', label: 'Surgery' },
  { id: 'scan-ultrasound', label: 'Ultrasound scan' },
  { id: 'scan-mri', label: 'MRI scan' },
  { id: 'physiotherapy', label: 'Physiotherapy' },
  { id: 'mental-health', label: 'Mental health' },
  { id: 'other', label: 'Other' },
];

export interface Appointment {
  id?: number;
  date: string; // ISO date
  time?: string; // HH:MM
  type: AppointmentType;
  providerName?: string;
  location?: string;
  reasonNotes?: string;
  outcomeNotes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id?: number;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
