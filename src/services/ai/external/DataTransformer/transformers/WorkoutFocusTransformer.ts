import { DataTransformerBase } from '../core/DataTransformerBase';
import { DEFAULT_VALUES } from '../constants/DefaultValues';
import { filterAvailableEquipment } from '../../../../../utils/equipmentRecommendations';

export interface WorkoutFocusData {
  customization_focus: string | { focus: string; focusLabel?: string; label?: string };
  customization_duration: number;
  customization_energy: number;
  customization_equipment?: string[];
  customization_soreness?: Record<string, { selected: boolean; rating: number }>;
}

export interface TransformedWorkoutData {
  focus: string;
  duration: number;
  energyLevel: number;
  equipment: string[];
  sorenessAreas: string[];
}

export class WorkoutFocusTransformer extends DataTransformerBase<WorkoutFocusData, TransformedWorkoutData> {
  transform(input: WorkoutFocusData): TransformedWorkoutData {
    // Defensive validation - this should never fail if ReviewPage validation passed
    if (!input) {
      this.log('❌ WorkoutFocusData is null in WorkoutFocusTransformer');
      throw new Error('WorkoutFocusData is required for workout generation');
    }

    try {
      // Extract focus value properly - handle both string and object formats
      const extractFocusValue = (focusData: any): string => {
        if (!focusData) return DEFAULT_VALUES.workout.customization_focus;
        
        // If it's already a string, return it
        if (typeof focusData === 'string') {
          return focusData;
        }
        
        // If it's an object (WorkoutFocusConfigurationData), extract the focus property
        if (typeof focusData === 'object' && focusData.focus) {
          return focusData.focus;
        }
        
        // If it's an object with focusLabel, use that
        if (typeof focusData === 'object' && focusData.focusLabel) {
          return focusData.focusLabel;
        }
        
        // If it's an object with label, use that
        if (typeof focusData === 'object' && focusData.label) {
          return focusData.label;
        }
        
        // Fallback to string conversion
        return String(focusData);
      };
      
      const focus = extractFocusValue(input.customization_focus);
      
      // Log the focus extraction for debugging
      this.log('Focus extraction:', {
        originalFocus: input.customization_focus,
        originalType: typeof input.customization_focus,
        extractedFocus: focus,
        isObject: typeof input.customization_focus === 'object'
      });

      // Transform soreness data
      const sorenessAreas = input.customization_soreness ? 
        Object.keys(input.customization_soreness)
          .filter(key => input.customization_soreness?.[key]?.selected)
          .map(key => `${key} (Level ${input.customization_soreness?.[key]?.rating || 0})`) :
        [];

      // 🔍 DEBUG: Log duration extraction
      console.log('🔍 DEBUG: WorkoutFocusTransformer - Duration extraction:', {
        inputCustomizationDuration: input.customization_duration,
        inputCustomizationDurationType: typeof input.customization_duration,
        defaultDuration: DEFAULT_VALUES.workout.customization_duration,
        finalDuration: input.customization_duration || DEFAULT_VALUES.workout.customization_duration
      });

      // Use default values for missing fields
      const result: TransformedWorkoutData = {
        focus,
        duration: input.customization_duration || DEFAULT_VALUES.workout.customization_duration,
        energyLevel: input.customization_energy || DEFAULT_VALUES.workout.customization_energy,
        equipment: Array.isArray(input.customization_equipment) ? 
          input.customization_equipment : 
          DEFAULT_VALUES.workout.customization_equipment,
        sorenessAreas
      };

      // Log transformation results for debugging
      this.log('Workout focus transformation successful', {
        input: {
          hasFocus: !!input.customization_focus,
          hasDuration: !!input.customization_duration,
          hasEnergy: !!input.customization_energy,
          totalFields: Object.keys(input).length
        },
        output: {
          focus: result.focus,
          duration: result.duration,
          energyLevel: result.energyLevel,
          equipmentCount: result.equipment.length,
          sorenessCount: result.sorenessAreas.length,
          totalFields: Object.keys(result).length
        }
      });

      return result;

    } catch (error) {
      this.log('Workout focus transformation failed', error);
      return this.handleError(error as Error);
    }
  }
} 