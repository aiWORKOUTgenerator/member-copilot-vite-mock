// QuickWorkoutSetup Feature - Prompt Selector
// Handles context-aware prompt selection and template variable injection

import { PromptTemplate } from '../../../types/external-ai.types';
import { UserProfile } from '../../../../types';
import { 
  QuickWorkoutParams, 
  DurationStrategyResult, 
  PromptSelectionResult,
  WorkflowContext 
} from '../types/quick-workout.types';
import { DurationConfig } from '../constants/quick-workout.constants';
import { 
  DURATION_PROMPTS, 
  selectDurationSpecificPrompt, 
  getPromptInfo 
} from '../prompts/index';

/**
 * Prompt selector for context-aware prompt selection and variable injection
 */
export class PromptSelector {
  
  /**
   * Select the optimal prompt based on duration strategy and context
   */
  selectPrompt(
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    userProfile: UserProfile
  ): PromptSelectionResult {
    console.log(`🎯 PromptSelector: Selecting prompt for ${durationResult.adjustedDuration}min workout`);

    // Get the duration-specific prompt
    const promptInfo = getPromptInfo(durationResult.adjustedDuration);
    const prompt = promptInfo.prompt;

    if (!prompt) {
      throw new Error(`No prompt template found for duration ${durationResult.adjustedDuration}min`);
    }

    // Build context-aware variables
    const variables = this.buildPromptVariables(durationResult, params, userProfile);

    // Analyze context factors that influenced selection
    const contextFactors = this.analyzeContextFactors(durationResult, params, userProfile);

    // Generate selection reasoning
    const selectionReasoning = this.generateSelectionReasoning(
      durationResult, 
      params, 
      promptInfo.isExactMatch
    );

    console.log(`✅ PromptSelector: Selected ${prompt.id} with ${Object.keys(variables).length} variables`);

    return {
      promptId: prompt.id,
      promptTemplate: prompt.template,
      variables,
      selectionReasoning,
      contextFactors
    };
  }

  /**
   * Build comprehensive prompt variables from context
   */
  private buildPromptVariables(
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    userProfile: UserProfile
  ): Record<string, unknown> {
    const config = durationResult.config;

    // Base variables
    const variables: Record<string, unknown> = {
      // Duration and structure
      duration: durationResult.adjustedDuration,
      durationName: config.name,
      durationDescription: config.description,
      
      // Exercise structure
      warmupExerciseCount: config.exerciseCount.warmup,
      mainExerciseCount: config.exerciseCount.main,
      cooldownExerciseCount: config.exerciseCount.cooldown,
      totalExerciseCount: config.exerciseCount.total,
      
      // Time allocation
      warmupPercent: config.timeAllocation.warmupPercent,
      mainPercent: config.timeAllocation.mainPercent,
      cooldownPercent: config.timeAllocation.cooldownPercent,
      
      // User profile
      fitnessLevel: params.fitnessLevel,
      experienceLevel: this.mapFitnessLevelToExperience(params.fitnessLevel),
      
      // Current state
      energyLevel: params.energyLevel,
      energyDescription: this.getEnergyDescription(params.energyLevel),
      sorenessAreas: params.sorenessAreas,
      hasSoreness: params.sorenessAreas.length > 0,
      sorenessCount: params.sorenessAreas.length,
      
      // Equipment and environment
      equipment: params.equipment,
      hasEquipment: params.equipment.length > 0,
      equipmentCount: params.equipment.length,
      location: params.location || 'home',
      
      // Workout focus
      focus: params.focus,
      focusArea: params.focus,
      
      // Preferences
      intensity: params.intensity || 'moderate',
      timeOfDay: params.timeOfDay || 'any time',
      
      // Complexity level
      complexity: config.complexity,
      isMinimal: config.complexity === 'minimal',
      isSimple: config.complexity === 'simple',
      isStandard: config.complexity === 'standard',
      isComprehensive: config.complexity === 'comprehensive',
      isAdvanced: config.complexity === 'advanced'
    };

    // Add user profile specific variables
    if (userProfile) {
      variables.userGoals = userProfile.goals || [];
      variables.hasGoals = (userProfile.goals || []).length > 0;
      variables.primaryGoal = (userProfile.goals || [])[0] || 'general fitness';
      
      // Add limitations if available
      if (userProfile.basicLimitations) {
        variables.availableEquipment = userProfile.basicLimitations.availableEquipment || [];
        variables.timeConstraints = userProfile.basicLimitations.timeConstraints || params.duration;
      }
    }

    // Add context-specific variables
    variables.contextualNotes = this.generateContextualNotes(params, config);
    variables.safetyConsiderations = this.generateSafetyConsiderations(params);
    variables.adaptationNotes = this.generateAdaptationNotes(params, config);

    // Add duration adjustment context if applicable
    if (!durationResult.isExactMatch) {
      variables.durationAdjusted = true;
      variables.originalDuration = params.duration;
      variables.adjustmentReason = durationResult.adjustmentReason;
    } else {
      variables.durationAdjusted = false;
    }

    console.log(`📝 PromptSelector: Built ${Object.keys(variables).length} variables for prompt generation`);
    
    return variables;
  }

  /**
   * Map fitness level to experience description
   */
  private mapFitnessLevelToExperience(fitnessLevel: string): string {
    const mapping: Record<string, string> = {
      'new to exercise': 'beginner with focus on learning proper form',
      'some experience': 'intermediate with moderate challenge level',
      'advanced athlete': 'advanced with high intensity and complex movements'
    };
    
    return mapping[fitnessLevel] || 'moderate experience level';
  }

  /**
   * Get energy level description
   */
  private getEnergyDescription(energyLevel: number): string {
    if (energyLevel <= 3) return 'low energy - gentle movements recommended';
    if (energyLevel <= 5) return 'moderate energy - balanced intensity';
    if (energyLevel <= 7) return 'good energy - ready for moderate challenge';
    return 'high energy - ready for intense workout';
  }

  /**
   * Generate contextual notes for the workout
   */
  private generateContextualNotes(params: QuickWorkoutParams, config: DurationConfig): string[] {
    const notes: string[] = [];

    // Duration-specific notes
    if (config.duration <= 10) {
      notes.push('Focus on compound movements for maximum efficiency in short time');
      notes.push('Minimize rest periods between exercises');
    } else if (config.duration >= 30) {
      notes.push('Opportunity for comprehensive warm-up and cool-down');
      notes.push('Can include variety of movement patterns');
    }

    // Energy level notes
    if (params.energyLevel <= 3) {
      notes.push('Keep intensity moderate to match current energy level');
      notes.push('Include more recovery time between exercises');
    } else if (params.energyLevel >= 8) {
      notes.push('Can incorporate high-intensity intervals');
      notes.push('Good opportunity for challenging exercises');
    }

    // Equipment notes
    if (params.equipment.length === 0) {
      notes.push('Body weight only - focus on bodyweight progressions');
    } else {
      notes.push(`Equipment available: ${params.equipment.join(', ')}`);
    }

    // Fitness level notes
    if (params.fitnessLevel === 'new to exercise') {
      notes.push('Prioritize proper form over speed or intensity');
      notes.push('Include exercise modifications for beginners');
    }

    return notes;
  }

  /**
   * Generate safety considerations
   */
  private generateSafetyConsiderations(params: QuickWorkoutParams): string[] {
    const safety: string[] = [];

    // Soreness considerations
    if (params.sorenessAreas.length > 0) {
      safety.push(`Avoid intense work on sore areas: ${params.sorenessAreas.join(', ')}`);
      safety.push('Focus on gentle movement and stretching for sore muscles');
    }

    // Energy level safety
    if (params.energyLevel <= 3) {
      safety.push('Listen to your body - stop if you feel overly fatigued');
      safety.push('Hydrate well and consider shorter rest periods');
    }

    // Beginner safety
    if (params.fitnessLevel === 'new to exercise') {
      safety.push('Start slowly and focus on learning proper form');
      safety.push('Don\'t hesitate to take breaks when needed');
    }

    // General safety
    safety.push('Always warm up before intense exercise');
    safety.push('Cool down properly to prevent stiffness');

    return safety;
  }

  /**
   * Generate adaptation notes
   */
  private generateAdaptationNotes(params: QuickWorkoutParams, config: DurationConfig): string[] {
    const adaptations: string[] = [];

    // Fitness level adaptations
    if (params.fitnessLevel === 'new to exercise') {
      adaptations.push('Provide easier modifications for each exercise');
      adaptations.push('Focus on 2-3 sets maximum');
    } else if (params.fitnessLevel === 'advanced athlete') {
      adaptations.push('Include advanced variations and progressions');
      adaptations.push('Can handle higher volume and intensity');
    }

    // Equipment adaptations
    if (params.equipment.length === 0) {
      adaptations.push('All exercises must be bodyweight only');
    } else if (params.equipment.includes('Dumbbells')) {
      adaptations.push('Can incorporate dumbbell exercises for added resistance');
    }

    // Duration adaptations
    if (config.complexity === 'minimal') {
      adaptations.push('Keep exercise selection simple and effective');
    } else if (config.complexity === 'comprehensive') {
      adaptations.push('Can include more complex movement patterns');
    }

    return adaptations;
  }

  /**
   * Analyze context factors that influenced prompt selection
   */
  private analyzeContextFactors(
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    userProfile: UserProfile
  ): string[] {
    const factors: string[] = [];

    // Duration factors
    if (!durationResult.isExactMatch) {
      factors.push(`Duration adjusted from ${params.duration}min to ${durationResult.adjustedDuration}min`);
    }
    factors.push(`Selected ${durationResult.config.name} template (${durationResult.config.complexity} complexity)`);

    // User state factors
    factors.push(`Energy level: ${params.energyLevel}/10`);
    factors.push(`Fitness level: ${params.fitnessLevel}`);
    
    if (params.sorenessAreas.length > 0) {
      factors.push(`Soreness in ${params.sorenessAreas.length} areas`);
    }

    // Equipment factors
    if (params.equipment.length === 0) {
      factors.push('Body weight workout');
    } else {
      factors.push(`${params.equipment.length} equipment types available`);
    }

    // Focus factors
    factors.push(`Focus area: ${params.focus}`);

    return factors;
  }

  /**
   * Generate reasoning for prompt selection
   */
  private generateSelectionReasoning(
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    isExactMatch: boolean
  ): string {
    const reasons: string[] = [];

    // Duration reasoning
    if (isExactMatch) {
      reasons.push(`Selected ${durationResult.adjustedDuration}min template as exact match for requested duration`);
    } else {
      reasons.push(`Selected ${durationResult.adjustedDuration}min template as closest match to ${params.duration}min request`);
      if (durationResult.adjustmentReason) {
        reasons.push(`Adjustment reason: ${durationResult.adjustmentReason}`);
      }
    }

    // Context reasoning
    const config = durationResult.config;
    reasons.push(`Using ${config.complexity} complexity template with ${config.exerciseCount.total} total exercises`);

    // Fitness level reasoning
    if (params.fitnessLevel === 'new to exercise') {
      reasons.push('Beginner-friendly approach with form emphasis');
    } else if (params.fitnessLevel === 'advanced athlete') {
      reasons.push('Advanced template with higher intensity potential');
    }

    // Equipment reasoning
    if (params.equipment.length === 0) {
      reasons.push('Body weight template for equipment-free workout');
    } else {
      reasons.push(`Equipment-enhanced template utilizing available tools`);
    }

    return reasons.join('. ');
  }

  /**
   * Validate prompt selection result
   */
  validateSelection(result: PromptSelectionResult): boolean {
    // Check required fields
    if (!result.promptId || !result.promptTemplate) {
      console.error('❌ PromptSelector: Missing required prompt fields');
      return false;
    }

    // Check variables
    if (!result.variables || Object.keys(result.variables).length === 0) {
      console.error('❌ PromptSelector: No prompt variables provided');
      return false;
    }

    // Check for required variables
    const requiredVars = ['duration', 'fitnessLevel', 'energyLevel', 'focus'];
    const missingVars = requiredVars.filter(v => !(v in result.variables));
    
    if (missingVars.length > 0) {
      console.error(`❌ PromptSelector: Missing required variables: ${missingVars.join(', ')}`);
      return false;
    }

    console.log(`✅ PromptSelector: Validation passed for prompt ${result.promptId}`);
    return true;
  }

  /**
   * Get available prompt templates
   */
  getAvailablePrompts(): Record<string, PromptTemplate> {
    return DURATION_PROMPTS;
  }

  /**
   * Get prompt by duration
   */
  getPromptByDuration(duration: number): PromptTemplate {
    return selectDurationSpecificPrompt(duration);
  }
} 