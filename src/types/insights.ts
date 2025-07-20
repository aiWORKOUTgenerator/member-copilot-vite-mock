// Shared insight types used across rating and AI modules
export type AIInsightType = 
  | 'critical_warning' 
  | 'warning' 
  | 'opportunity' 
  | 'optimization' 
  | 'education' 
  | 'encouragement'
  | 'muscle_focus'
  | 'training_emphasis';

export type AIInsightCategory = 
  | 'safety' 
  | 'performance' 
  | 'recovery' 
  | 'equipment' 
  | 'time_management'
  | 'workout_focus';

export type AIInsightPriority = 'low' | 'medium' | 'high';

export interface AIInsight {
  id: string;                    // Unique identifier for the insight
  type: AIInsightType;
  title?: string;
  content?: string;
  message?: string;
  recommendation?: string;       // Specific recommendation text
  priority?: AIInsightPriority;
  category?: AIInsightCategory;
  confidence?: number;
  actionable?: boolean;
  relatedFields?: string[];
  metadata?: Record<string, any>;
}

// Specific insight types
export interface SafetyInsight extends AIInsight {
  type: 'critical_warning' | 'warning';
  category: 'safety';
  priority: 'high';
}

export interface PerformanceInsight extends AIInsight {
  type: 'optimization' | 'opportunity';
  category: 'performance';
}

export interface RecoveryInsight extends AIInsight {
  type: 'warning' | 'education';
  category: 'recovery';
}

export interface WorkoutFocusInsight extends AIInsight {
  type: 'muscle_focus' | 'training_emphasis';
  category: 'workout_focus';
  title: string;
  content: string;
}

// Helper type for insight collections
export type AIInsightCollection = {
  safety?: SafetyInsight[];
  performance?: PerformanceInsight[];
  recovery?: RecoveryInsight[];
  workoutFocus?: WorkoutFocusInsight[];
}; 