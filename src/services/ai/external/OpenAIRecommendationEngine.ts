// OpenAI-powered recommendation engine for enhanced workout recommendations
import { OpenAIService } from './OpenAIService';
import { 
  EnhancedRecommendation,
  UserPreferenceAnalysis,
  WorkoutGenerationRequest
} from './types/external-ai.types';
// Import missing types and constants
import { 
  UserProfile 
} from '../../../types';
import { AIRecommendationContext } from '../../../types/ai';
import { EquipmentSpec } from '../../../types/equipment';
import { RECOMMENDATION_SYSTEM_PROMPT } from './prompts/recommendation.prompts';

// Type aliases for missing types
type RecommendationContext = AIRecommendationContext;
type EquipmentType = EquipmentSpec;

// Missing interface for OpenAI recommendation request
interface OpenAIRecommendationRequest {
  userProfile: UserProfile;
  currentState: {
    energyLevel: number;
    soreness: string[];
    availableTime: number;
    focusAreas: string[];
  };
  preferences: {
    workoutTypes: string[];
    intensityPreference: string;
    durationPreference: string;
  };
  context?: string;
}

// Helper function to convert WorkoutGenerationRequest to OpenAIRecommendationRequest
function convertToOpenAIRequest(request: WorkoutGenerationRequest): OpenAIRecommendationRequest {
  return {
    userProfile: request.userProfile,
    currentState: {
      energyLevel: request.constraints?.energyLevel || 5,
      soreness: request.constraints?.sorenessAreas || [],
      availableTime: request.preferences.duration,
      focusAreas: [request.preferences.focus]
    },
    preferences: {
      workoutTypes: [request.preferences.focus],
      intensityPreference: request.preferences.intensity,
      durationPreference: request.preferences.duration.toString()
    },
    context: 'workout_generation'
  };
}

// Missing RECOMMENDATION_PROMPTS constant (commented out until needed)
// const RECOMMENDATION_PROMPTS = {
//   contextual: {
//     system: RECOMMENDATION_SYSTEM_PROMPT
//   },
//   preference: {
//     system: RECOMMENDATION_SYSTEM_PROMPT
//   },
//   quick: {
//     system: RECOMMENDATION_SYSTEM_PROMPT
//   }
// };

export class OpenAIRecommendationEngine {
  private openAIService: OpenAIService;
  // Remove unused config variable
  // private config = getOpenAIConfig();

  constructor(openAIService?: OpenAIService) {
    this.openAIService = openAIService || new OpenAIService();
  }

  /**
   * Generate enhanced recommendations using OpenAI
   */
  async generateEnhancedRecommendations(
    request: WorkoutGenerationRequest
  ): Promise<EnhancedRecommendation[]> {
    try {
      const openAIRequest = convertToOpenAIRequest(request);
      const prompt = this.buildRecommendationPrompt(openAIRequest);
      
      // TODO: Implement OpenAI API call when service is ready
      console.log('OpenAI recommendation generation requested:', prompt);
      
      return this.getFallbackRecommendations(openAIRequest);
    } catch (error) {
      console.error('OpenAI recommendation generation failed:', error);
      const openAIRequest = convertToOpenAIRequest(request);
      return this.getFallbackRecommendations(openAIRequest);
    }
  }

  /**
   * Generate contextual recommendations based on specific context
   */
  async generateContextualRecommendations(
    context: RecommendationContext,
    userProfile: UserProfile
  ): Promise<EnhancedRecommendation[]> {
    try {
      const contextPrompt = this.buildContextualPrompt(context, userProfile);
      
      // TODO: Implement when OpenAIService.generateChatCompletion is available
      console.log('Contextual recommendation generation requested:', contextPrompt);
      
      return this.getContextualFallbacks(context);
    } catch (error) {
      console.error('Contextual recommendation generation failed:', error);
      return this.getContextualFallbacks(context);
    }
  }

  /**
   * Analyze user preferences and generate personalized insights
   */
  async analyzeUserPreferences(
    userProfile: UserProfile,
    workoutHistory: any[]
  ): Promise<UserPreferenceAnalysis> {
    try {
      const analysisPrompt = this.buildPreferenceAnalysisPrompt(userProfile, workoutHistory);
      
      // TODO: Implement when OpenAIService.generateChatCompletion is available
      console.log('User preference analysis requested:', analysisPrompt);
      
      return this.getFallbackPreferenceAnalysis(userProfile);
    } catch (error) {
      console.error('User preference analysis failed:', error);
      return this.getFallbackPreferenceAnalysis(userProfile);
    }
  }

  /**
   * Generate quick recommendations for immediate use
   */
  async generateQuickRecommendations(
    energyLevel: number,
    availableTime: number,
    equipment: EquipmentType[]
  ): Promise<EnhancedRecommendation[]> {
    try {
      const quickPrompt = this.buildQuickRecommendationPrompt(energyLevel, availableTime, equipment);
      
      // TODO: Implement when OpenAIService.generateChatCompletion is available
      console.log('Quick recommendation generation requested:', quickPrompt);
      
      return this.getQuickFallbacks(energyLevel, availableTime, equipment);
    } catch (error) {
      console.error('Quick recommendation generation failed:', error);
      return this.getQuickFallbacks(energyLevel, availableTime, equipment);
    }
  }

  /**
   * Build recommendation prompt from request
   */
  private buildRecommendationPrompt(request: OpenAIRecommendationRequest): string {
    const { userProfile, currentState, preferences, context } = request;
    
    return `
Generate enhanced workout recommendations based on the following information:

User Profile:
- Fitness Level: ${userProfile.fitnessLevel}
- Primary Goals: ${userProfile.goals.join(', ')}
- Available Time: ${userProfile.enhancedLimitations.timeConstraints} minutes
- Equipment: ${userProfile.basicLimitations.availableEquipment.join(', ')}

Current State:
- Energy Level: ${currentState.energyLevel}/10
- Muscle Soreness: ${currentState.soreness}/10
- Available Time: ${currentState.availableTime} minutes
- Focus Areas: ${currentState.focusAreas.join(', ')}

Preferences:
- Workout Types: ${preferences.workoutTypes.join(', ')}
- Intensity Preference: ${preferences.intensityPreference}
- Duration Preference: ${preferences.durationPreference}

Context: ${context || 'General workout planning'}

Please provide 3-5 specific, actionable recommendations with scientific backing and personalized reasoning.
    `.trim();
  }

  /**
   * Build contextual prompt for specific scenarios
   */
  private buildContextualPrompt(context: RecommendationContext, userProfile: UserProfile): string {
    return `
Provide contextual recommendations for user workout planning.

User Context:
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Current Selections: ${JSON.stringify(context.currentSelections)}
- Environmental Factors: ${JSON.stringify(context.environmentalFactors)}

Focus on personalized recommendations with emphasis on safety and effectiveness.
    `.trim();
  }

  /**
   * Build preference analysis prompt
   */
  private buildPreferenceAnalysisPrompt(userProfile: UserProfile, workoutHistory: any[]): string {
    return `
Analyze user preferences based on profile and workout history:

User Profile:
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Stated Preferences: ${userProfile.preferences || 'None provided'}

Workout History Summary:
- Total Workouts: ${workoutHistory.length}
- Common Patterns: ${this.extractWorkoutPatterns(workoutHistory)}

Identify preferred workout styles, optimal timing, motivation factors, and progression preferences.
    `.trim();
  }

  /**
   * Build quick recommendation prompt
   */
  private buildQuickRecommendationPrompt(
    energyLevel: number,
    availableTime: number,
    equipment: EquipmentType[]
  ): string {
    return `
Generate quick workout recommendations for:
- Energy Level: ${energyLevel}/10
- Available Time: ${availableTime} minutes
- Equipment: ${equipment.map(e => e.name).join(', ')}

Focus on time-efficient, effective workouts that match the energy level and available equipment.
    `.trim();
  }

  /**
   * Parse recommendation response from OpenAI
   */
  private parseRecommendationResponse(_content: string): EnhancedRecommendation[] {
    try {
      // TODO: Implement proper JSON parsing when OpenAI integration is complete
      return [];
    } catch (error) {
      console.error('Failed to parse recommendation response:', error);
      return [];
    }
  }

  /**
   * Parse contextual recommendations
   */
  private parseContextualRecommendations(content: string, context: RecommendationContext): EnhancedRecommendation[] {
    try {
      // TODO: Implement proper parsing when OpenAI integration is complete
      return [];
    } catch (error) {
      console.error('Failed to parse contextual recommendations:', error);
      return [];
    }
  }

  /**
   * Parse preference analysis
   */
  private parsePreferenceAnalysis(content: string): UserPreferenceAnalysis {
    try {
      // TODO: Implement proper parsing when OpenAI integration is complete
      return this.getFallbackPreferenceAnalysis({} as UserProfile);
    } catch (error) {
      console.error('Failed to parse preference analysis:', error);
      return this.getFallbackPreferenceAnalysis({} as UserProfile);
    }
  }

  /**
   * Parse quick recommendations
   */
  private parseQuickRecommendations(content: string): EnhancedRecommendation[] {
    try {
      // TODO: Implement proper parsing when OpenAI integration is complete
      return [];
    } catch (error) {
      console.error('Failed to parse quick recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate confidence for recommendation
   */
  private calculateConfidence(recommendation: EnhancedRecommendation, request: OpenAIRecommendationRequest): number {
    // TODO: Implement confidence calculation logic
    return 0.8;
  }

  /**
   * Extract workout patterns from history
   */
  private extractWorkoutPatterns(workoutHistory: any[]): string {
    if (workoutHistory.length === 0) return 'No workout history available';
    
    // TODO: Implement pattern extraction logic
    return 'Pattern analysis not yet implemented';
  }

  /**
   * Extract workout styles from content
   */
  private extractWorkoutStyles(content: string): string[] {
    // TODO: Implement style extraction logic
    return ['general'];
  }

  /**
   * Extract optimal timing from content
   */
  private extractOptimalTiming(content: string): string {
    // TODO: Implement timing extraction logic
    return 'morning';
  }

  /**
   * Extract motivation factors from content
   */
  private extractMotivationFactors(content: string): string[] {
    // TODO: Implement motivation extraction logic
    return ['general fitness'];
  }

  /**
   * Extract progression preferences from content
   */
  private extractProgressionPreferences(content: string): string {
    // TODO: Implement progression extraction logic
    return 'gradual';
  }

  /**
   * Get fallback recommendations when OpenAI is unavailable
   */
  private getFallbackRecommendations(request: OpenAIRecommendationRequest): EnhancedRecommendation[] {
    return [
             {
         id: 'fallback_1',
         priority: 'medium',
         category: 'safety',
         targetComponent: 'general',
         title: 'Start with a warm-up',
         description: 'Always begin your workout with 5-10 minutes of light cardio and dynamic stretching.',
         reasoning: 'Proper warm-up reduces injury risk and improves performance.',
         confidence: 0.9,
         risk: 'low',
         aiGenerated: false,
         personalizedReasoning: 'This is a fundamental fitness principle that applies to all workouts.',
         userSpecificFactors: ['general fitness principle'],
         alternativeOptions: [],
         action: {
           type: 'show_education',
           field: 'warmup',
           value: '5-10 minutes'
         }
       },
       {
         id: 'fallback_2',
         priority: 'medium',
         category: 'safety',
         targetComponent: 'general',
         title: 'Listen to your body',
         description: 'Pay attention to how you feel during the workout and adjust intensity accordingly.',
         reasoning: 'Body awareness helps prevent overtraining and injury.',
         confidence: 0.85,
         risk: 'low',
         aiGenerated: false,
         personalizedReasoning: 'This guidance helps ensure safe and effective workouts.',
         userSpecificFactors: ['safety principle'],
         alternativeOptions: [],
         action: {
           type: 'show_education',
           field: 'intensity',
           value: 'moderate'
         }
       }
    ];
  }

  /**
   * Get contextual fallback recommendations
   */
  private getContextualFallbacks(context: RecommendationContext): EnhancedRecommendation[] {
    return [
             {
         id: 'contextual_fallback_1',
         priority: 'medium',
         category: 'safety',
         targetComponent: 'general',
         title: 'Consider your current state',
         description: 'Adjust your workout based on your current energy level and any soreness.',
         reasoning: 'Contextual awareness improves workout effectiveness and safety.',
         confidence: 0.8,
         risk: 'low',
         aiGenerated: false,
         personalizedReasoning: 'This recommendation considers your current physical state.',
         userSpecificFactors: ['contextual awareness'],
         alternativeOptions: [],
         action: {
           type: 'show_education',
           field: 'context',
           value: 'current_state'
         }
       }
    ];
  }

  /**
   * Get fallback preference analysis
   */
  private getFallbackPreferenceAnalysis(userProfile: UserProfile): UserPreferenceAnalysis {
    return {
      preferredWorkoutStyles: ['general fitness'],
      optimalWorkoutTimes: ['morning'],
      motivationFactors: ['health and wellness'],
      challengeAreas: ['consistency'],
      strengthAreas: ['determination'],
      recommendedProgression: {
        currentLevel: userProfile.fitnessLevel,
        nextMilestones: [],
        timeframe: '4-6 weeks',
        keyFocusAreas: ['consistency', 'progressive overload'],
        potentialChallenges: ['time management', 'motivation']
      },
      personalityInsights: {
        workoutStyle: 'flexible',
        motivationType: 'mixed',
        preferredChallengeLevel: 'moderate',
        socialPreference: 'solo',
        feedbackStyle: 'encouraging'
      }
    };
  }

  /**
   * Get quick fallback recommendations
   */
  private getQuickFallbacks(
    energyLevel: number,
    availableTime: number,
    equipment: EquipmentType[]
  ): EnhancedRecommendation[] {
    return [
             {
         id: 'quick_fallback_1',
         priority: 'high',
         category: 'efficiency',
         targetComponent: 'duration',
         title: 'Focus on compound movements',
         description: `With ${availableTime} minutes available, prioritize compound exercises that work multiple muscle groups.`,
         reasoning: 'Compound movements provide maximum efficiency for time-constrained workouts.',
         confidence: 0.9,
         risk: 'low',
         aiGenerated: false,
         personalizedReasoning: `Your ${availableTime}-minute time constraint makes compound movements ideal.`,
         userSpecificFactors: [`${availableTime} minutes available`, `energy level: ${energyLevel}/10`],
         alternativeOptions: [],
         action: {
           type: 'suggest_alternative',
           field: 'exercise_type',
           value: 'compound_movements'
         }
       }
    ];
  }
} 