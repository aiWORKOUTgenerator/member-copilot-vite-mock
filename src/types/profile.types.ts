export interface TimeConstraints {
  minDuration: number;
  maxDuration: number;
  preferredDuration: number;
}

export interface UserPreferences {
  workoutStyle: string[];
  timePreference: string;
  intensityPreference: string;
  timeConstraints: TimeConstraints;
  equipmentConstraints: string[];
  locationConstraints: string[];
}

export interface HealthData {
  injuries: string[];
  age?: number;
  height?: number;
  weight?: number;
}

export interface UserProfile {
  fitnessLevel: FitnessLevel;
  goals: string[];
  preferences: UserPreferences;
  healthData: HealthData;
} 