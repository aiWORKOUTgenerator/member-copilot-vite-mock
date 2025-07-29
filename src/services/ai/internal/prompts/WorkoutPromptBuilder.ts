import { 
  InternalPromptContext, 
  InternalPromptVariables,
  PromptBuilder 
} from '../types/internal-prompt.types';
import { 
  EnergyAIService, 
  SorenessAIService, 
  FocusAIService, 
  DurationAIService, 
  EquipmentAIService 
} from '../../domains';
import { GlobalAIContext } from '../../core/types/AIServiceTypes';
import { InternalPromptTransformer } from '../utils/DataTransformers';
import { PerWorkoutOptions } from '../../../../types';
import { aiLogger } from '../../logging/AILogger';

export class WorkoutPromptBuilder implements PromptBuilder {
  private errors: string[] = [];
  private context: Partial<InternalPromptContext> | null = null;
  private energyService: EnergyAIService;
  private sorenessService: SorenessAIService;
  private focusService: FocusAIService;
  private durationService: DurationAIService;
  private equipmentService: EquipmentAIService;

  constructor() {
    this.energyService = new EnergyAIService();
    this.sorenessService = new SorenessAIService();
    this.focusService = new FocusAIService();
    this.durationService = new DurationAIService();
    this.equipmentService = new EquipmentAIService();
  }

  /**
   * Build internal prompt context from workout data
   */
  public buildContext(data: PerWorkoutOptions): Partial<InternalPromptContext> {
    try {
      this.errors = [];

      // Validate required fields
      if (!this.validateWorkoutData(data)) {
        return {};
      }

      // Transform workout data
      const transformedData = InternalPromptTransformer.transformData({} as any, data);

      // Create GlobalAIContext for domain services
      const globalContext: GlobalAIContext = this.createGlobalContext(transformedData);

      // Analyze workout components using domain services (synchronously for now)
      // Note: This is a simplified version that doesn't use async analysis
      const energyAnalysis: any[] = [];
      const sorenessAnalysis: any[] | null = data.customization_soreness ? [] : null;
      const focusAnalysis: any[] = [];
      const durationAnalysis: any[] = [];
      const equipmentAnalysis: any[] = [];

      // Build enhanced workout context
      const context: Partial<InternalPromptContext> = {
        workout: {
          focus: transformedData.workout.focus,
          duration: transformedData.workout.duration.minutes,
          energyLevel: transformedData.workout.energy.rating,
          intensity: this.determineWorkoutIntensity(
            transformedData.workout.energy.rating,
            energyAnalysis
          ),
          equipment: this.optimizeEquipmentSelection(
            transformedData.workout.equipment,
            equipmentAnalysis
          ),
          areas: this.determineFocusAreas(
            transformedData.workout.focus,
            focusAnalysis,
            sorenessAnalysis
          ),
          soreness: sorenessAnalysis ? {
            rating: transformedData.workout.soreness.rating,
            areas: this.adjustSorenessAreas(
              transformedData.workout.soreness.areas || [],
              sorenessAnalysis
            )
          } : undefined
        }
      };

      this.context = context;

      aiLogger.debug('WorkoutPromptBuilder - Context built successfully', {
        hasWorkout: !!context.workout,
        focus: context.workout?.focus,
        duration: context.workout?.duration,
        energyLevel: context.workout?.energyLevel,
        hasSoreness: !!context.workout?.soreness
      });

      return context;

    } catch (error) {
      this.handleError('Failed to build workout context', error);
      return {};
    }
  }

  /**
   * Build prompt variables from context
   */
  public buildVariables(context: InternalPromptContext): InternalPromptVariables {
    try {
      return {
        fitnessContext: {
          level: context.profile.fitnessLevel,
          experience: context.profile.experienceLevel,
          goal: context.profile.primaryGoal,
          limitations: context.profile.injuries
        },
        workoutContext: {
          focus: context.workout.focus,
          duration: context.workout.duration,
          energy: context.workout.energyLevel,
          intensity: context.workout.intensity || context.profile.calculatedWorkoutIntensity || 'moderate',
          equipment: context.workout.equipment,
          targetAreas: context.workout.areas
        },
        userPreferences: {
          style: context.preferences.workoutStyle,
          time: context.preferences.timePreference,
          intensity: context.preferences.intensityPreference,
          advanced: context.preferences.advancedFeatures,
          assistance: context.preferences.aiAssistanceLevel
        }
      };
    } catch (error) {
      this.handleError('Failed to build prompt variables', error);
      return {} as InternalPromptVariables;
    }
  }

  /**
   * Validate the built context
   */
  public validate(): boolean {
    if (!this.context) {
      this.errors.push('No context built yet');
      return false;
    }

    if (!this.context.workout) {
      this.errors.push('Missing workout data in context');
      return false;
    }

    const { workout } = this.context;

    if (!workout.focus) {
      this.errors.push('Missing workout focus');
    }

    if (!workout.duration || workout.duration <= 0) {
      this.errors.push('Invalid workout duration');
    }

    if (!workout.energyLevel || workout.energyLevel < 1 || workout.energyLevel > 10) {
      this.errors.push('Invalid energy level');
    }

    return this.errors.length === 0;
  }

  /**
   * Get validation errors
   */
  public getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Validate workout data
   */
  private validateWorkoutData(data: PerWorkoutOptions): boolean {
    if (!data) {
      this.errors.push('No workout data provided');
      return false;
    }

    if (!data.customization_focus) {
      this.errors.push('Missing workout focus');
    }

    const duration = typeof data.customization_duration === 'number' ? 
      data.customization_duration : 
      (data.customization_duration as any)?.minutes || 0;
    
    if (!duration || duration <= 0) {
      this.errors.push('Invalid workout duration');
    }

    if (!data.customization_energy || !data.customization_energy.rating) {
      this.errors.push('Missing energy level');
    }

    return this.errors.length === 0;
  }

  /**
   * Create GlobalAIContext from transformed data
   */
  private createGlobalContext(transformedData: any): GlobalAIContext {
    return {
      userProfile: {
        fitnessLevel: 'intermediate', // Default value
        goals: [],
        preferences: {
          workoutStyle: [],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: transformedData.workout.equipment || [],
          availableLocations: []
        },
        enhancedLimitations: {
          timeConstraints: transformedData.workout.duration.minutes,
          equipmentConstraints: transformedData.workout.equipment || [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: transformedData.workout.duration.minutes,
          preferredFocusAreas: [transformedData.workout.focus],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.8,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      },
      currentSelections: {
        customization_focus: transformedData.workout.focus,
        customization_duration: transformedData.workout.duration.minutes,
        customization_energy: {
          rating: transformedData.workout.energy.rating,
          categories: []
        },
        customization_equipment: transformedData.workout.equipment || [],
        customization_soreness: transformedData.workout.soreness ? {
          rating: transformedData.workout.soreness.rating,
          categories: transformedData.workout.soreness.areas || []
        } : undefined
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: true
      }
    };
  }

  /**
   * Determine workout intensity based on energy analysis
   */
  private determineWorkoutIntensity(
    energyLevel: number,
    analysis: any[]
  ): 'light' | 'moderate' | 'intense' {
    // Use energy level as primary indicator
    if (energyLevel <= 3) return 'light';
    if (energyLevel <= 7) return 'moderate';
    return 'intense';
  }

  /**
   * Optimize equipment selection based on analysis
   */
  private optimizeEquipmentSelection(equipment: string[], analysis: any[]): string[] {
    // For now, return the original equipment list
    // This could be enhanced with analysis-based optimization
    return equipment;
  }

  /**
   * Determine focus areas based on analysis
   */
  private determineFocusAreas(
    focus: string,
    focusAnalysis: any[],
    sorenessAnalysis: any[] | null
  ): string[] {
    // For now, return the focus as a single area
    // This could be enhanced with analysis-based area determination
    return [focus];
  }

  /**
   * Adjust soreness areas based on analysis
   */
  private adjustSorenessAreas(areas: string[], analysis: any[]): string[] {
    // For now, return the original areas
    // This could be enhanced with analysis-based adjustments
    return areas;
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    const errorMessage = `${message}: ${error instanceof Error ? error.message : String(error)}`;
    this.errors.push(errorMessage);
    aiLogger.error({
      error: error instanceof Error ? error : new Error(String(error)),
      context: 'workout prompt builder',
      component: 'WorkoutPromptBuilder',
      severity: 'medium',
      userImpact: false
    });
  }
}