// Pattern 2: Progressive Equipment Selection
export interface EquipmentSelectionData {
  location?: string;                    // Gym, Home, Outdoor
  contexts: string[];                   // Weight Training, Cardio, etc.
  specificEquipment: string[];          // Dumbbells, Barbells & Weight Plates, etc.
  weights?: { [equipmentType: string]: number[] }; // Available weights
  lastUpdated?: Date;                   // For smart recommendations
  
  // Enhanced metadata for AI recommendations
  metadata?: {
    totalValue?: number;                // Equipment investment level
    spaceRequired?: 'minimal' | 'moderate' | 'large';
    maintenanceLevel?: 'low' | 'medium' | 'high';
    userExperience?: 'new to exercise' | 'some experience' | 'advanced athlete';
    aiRecommendations?: string[];
  };
  
  // Progressive disclosure state
  disclosureLevel?: 1 | 2 | 3 | 4;
  userPreferences?: {
    preferredBrands?: string[];
    budgetRange?: 'low' | 'medium' | 'high';
    spaceConstraints?: string[];
  };
}

// Equipment location types
export type EquipmentLocation = 'gym' | 'home' | 'outdoor';

// Equipment context types
export type EquipmentContext = 'strength' | 'cardio' | 'flexibility' | 'functional';

// Equipment category types
export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  location: EquipmentLocation[];
  context: EquipmentContext[];
}

// Equipment specification types
export interface EquipmentSpec {
  name: string;
  category: string;
  defaultWeights?: number[];
  spaceRequired: 'minimal' | 'moderate' | 'large';
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  versatility: number; // 1-10 scale
}

// Equipment validation types
export interface EquipmentValidation {
  hasMinimumEquipment: boolean;
  conflictingSelections: string[];
  recommendations: string[];
  missingForGoals: string[];
} 