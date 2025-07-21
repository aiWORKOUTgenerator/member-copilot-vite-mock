import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
import { PageHeader } from '../../shared';
import { WorkoutFocusSection } from './WorkoutFocusSection';
import { WorkoutDurationSection } from './WorkoutDurationSection';
import { EnergyLevelSection } from './EnergyLevelSection';
import { MuscleSorenessSection } from './MuscleSorenessSection';
import { useQuickWorkoutForm } from '../hooks/useQuickWorkoutForm';
import { QuickWorkoutFormProps } from '../types/quick-workout.types';
import { UserProfile, AIRecommendationContext, PerWorkoutOptions, CategoryRatingData } from '../../../types';
import { CrossComponentAnalysisPanel } from './CrossComponentAnalysisPanel';
import { 
  WorkoutFocusData, 
  WORKOUT_FOCUS_OPTIONS, 
  FOCUS_AREAS_OPTIONS, 
  EQUIPMENT_OPTIONS,
  SORENESS_OPTIONS 
} from '../../../schemas/workoutFocusSchema';

interface EnhancedQuickWorkoutFormProps extends QuickWorkoutFormProps {
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  initialData?: PerWorkoutOptions;
  onDataUpdate?: (data: PerWorkoutOptions, workoutType: 'quick') => void;
}

// Helper function to convert WorkoutFocusData to PerWorkoutOptions
const mapToPerWorkoutOptions = (focusData: WorkoutFocusData): PerWorkoutOptions => {
  // Create soreness data in the correct format
  const sorenessData: CategoryRatingData = {};
  
  // If soreness level is set but no specific areas are selected, create a general soreness entry
  if (focusData.sorenessLevel > 0) {
    if (focusData.currentSoreness.length > 0) {
      // Use specific areas if selected
      focusData.currentSoreness.forEach(area => {
        if (SORENESS_OPTIONS.includes(area)) {
          sorenessData[area] = {
            selected: true,
            rating: focusData.sorenessLevel,
            label: area,
            description: `Soreness level ${focusData.sorenessLevel} in ${area}`,
            metadata: {
              severity: focusData.sorenessLevel >= 8 ? 'severe' :
                       focusData.sorenessLevel >= 5 ? 'moderate' : 'mild',
              affectedActivities: ['strength_training', 'cardio', 'flexibility']
            }
          };
        }
      });
    } else {
      // Create a general soreness entry if no specific areas are selected
      sorenessData['general'] = {
        selected: true,
        rating: focusData.sorenessLevel,
        label: 'General Soreness',
        description: `General soreness level ${focusData.sorenessLevel}`,
        metadata: {
          severity: focusData.sorenessLevel >= 8 ? 'severe' :
                   focusData.sorenessLevel >= 5 ? 'moderate' : 'mild',
          affectedActivities: ['strength_training', 'cardio', 'flexibility']
        }
      };
    }
  }

  return {
    customization_focus: focusData.workoutFocus || undefined,
    customization_duration: focusData.workoutDuration || undefined,
    customization_energy: focusData.energyLevel || undefined,
    customization_soreness: Object.keys(sorenessData).length > 0 ? sorenessData : undefined,
    customization_areas: focusData.focusAreas.length > 0 ? 
      focusData.focusAreas.filter((area): area is typeof FOCUS_AREAS_OPTIONS[number] => 
        FOCUS_AREAS_OPTIONS.includes(area as any)
      ) : undefined,
    customization_equipment: focusData.equipment.length > 0 ? 
      focusData.equipment.filter((equip): equip is typeof EQUIPMENT_OPTIONS[number] => 
        EQUIPMENT_OPTIONS.includes(equip as any)
      ) : undefined
  };
};

// Helper function to convert PerWorkoutOptions to WorkoutFocusData
const mapFromPerWorkoutOptions = (options: PerWorkoutOptions): Partial<WorkoutFocusData> => {
  // Extract soreness data
  const sorenessAreas = options.customization_soreness ? 
    Object.entries(options.customization_soreness)
      .filter(([_, data]) => data.selected)
      .map(([area]) => area)
      .filter((area): area is typeof SORENESS_OPTIONS[number] => 
        SORENESS_OPTIONS.includes(area as any)
      ) : [];
  
  const sorenessLevel = options.customization_soreness ?
    Math.max(...Object.values(options.customization_soreness)
      .filter(data => data.selected)
      .map(data => data.rating || 0)
    ) : 0;

  return {
    workoutFocus: options.customization_focus as typeof WORKOUT_FOCUS_OPTIONS[number] || '',
    workoutDuration: typeof options.customization_duration === 'number' ? 
      options.customization_duration : 0,
    energyLevel: options.customization_energy || 0,
    sorenessLevel,
    currentSoreness: sorenessAreas,
    focusAreas: Array.isArray(options.customization_areas) ? 
      options.customization_areas.filter((area): area is typeof FOCUS_AREAS_OPTIONS[number] => 
        FOCUS_AREAS_OPTIONS.includes(area as any)
      ) : [],
    equipment: Array.isArray(options.customization_equipment) ? 
      options.customization_equipment.filter((equip): equip is typeof EQUIPMENT_OPTIONS[number] => 
        EQUIPMENT_OPTIONS.includes(equip as any)
      ) : []
  };
};

export const QuickWorkoutForm: React.FC<EnhancedQuickWorkoutFormProps> = ({
  onNavigate,
  onBack,
  userProfile,
  aiContext,
  initialData,
  onDataUpdate
}) => {
  const hasInitialized = useRef(false);
  const lastUpdateRef = useRef<string | null>(null);
  
  const {
    focusData,
    viewMode,
    handleInputChange: hookInputChange,
    toggleViewMode,
    isFormValid
  } = useQuickWorkoutForm();

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData && !hasInitialized.current) {
      hasInitialized.current = true;
      const mappedData = mapFromPerWorkoutOptions(initialData);
      Object.entries(mappedData).forEach(([field, value]) => {
        if (value !== undefined) {
          // Skip array fields as they'll be handled by their respective components
          if (!Array.isArray(value)) {
            hookInputChange(field as keyof WorkoutFocusData, value);
          }
        }
      });
    }
  }, [initialData, hookInputChange]);

  // Cast the input change function to match the expected type
  const handleInputChange = (field: string, value: any) => {
    // Convert string values to numbers for numeric fields
    const convertedValue = field === 'workoutDuration' || field === 'energyLevel' || field === 'sorenessLevel'
      ? Number(value)
      : value;
    
    // Skip array fields as they'll be handled by their respective components
    if (!Array.isArray(convertedValue)) {
      hookInputChange(field as keyof WorkoutFocusData, convertedValue);
    }
    
    // Prevent duplicate updates
    const updateKey = `${field}:${JSON.stringify(convertedValue)}`;
    if (lastUpdateRef.current === updateKey) {
      return;
    }
    lastUpdateRef.current = updateKey;
    
    // Propagate changes up if needed
    if (onDataUpdate) {
      const updatedFocusData = {
        ...focusData,
        [field]: convertedValue
      };
      onDataUpdate(mapToPerWorkoutOptions(updatedFocusData), 'quick');
    }
  };

  const handleSubmit = () => {
    if (isFormValid) {
      // Save final data before navigating
      if (onDataUpdate) {
        onDataUpdate(mapToPerWorkoutOptions(focusData), 'quick');
      }
      onNavigate('review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quick Workout Setup"
          subtitle="Just a few quick questions to generate your personalized workout"
          icon={Sparkles}
          gradient="from-emerald-500 to-blue-600"
        />
        
        {/* View Mode Toggle */}
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {viewMode === 'complex' ? (
            <>
              <LayoutList className="w-4 h-4" />
              <span>Simple View</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span>Detailed View</span>
            </>
          )}
        </button>
      </div>

      {/* Cross-Component AI Analysis */}
      <CrossComponentAnalysisPanel 
        focusData={focusData}
        userProfile={userProfile}
        viewMode={viewMode}
      />

      {/* Quick Form */}
      <div className="space-y-8">
        <WorkoutFocusSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
          userProfile={userProfile}
          _aiContext={aiContext}
        />
        
        <WorkoutDurationSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
          userProfile={userProfile}
          _aiContext={aiContext}
        />
        
        <EnergyLevelSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
          userProfile={userProfile}
          _aiContext={aiContext}
        />

        <MuscleSorenessSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
          userProfile={userProfile}
          _aiContext={aiContext}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-300"
          >
            Back to Options
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex-1 flex items-center justify-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group ${
              isFormValid
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Generate Quick Workout</span>
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}; 