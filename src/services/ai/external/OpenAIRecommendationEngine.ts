// OpenAI-powered recommendation engine for enhanced workout recommendations
import { OpenAIService } from './OpenAIService';
import { getOpenAIConfig } from './config/openai.config';
import { 
  OpenAIRecommendationRequest, 
  OpenAIRecommendationResponse, 
  EnhancedRecommendation,
  UserPreferenceAnalysis,
  RecommendationContext
} from './types/external-ai.types';
import { 
  RECOMMENDATION_PROMPTS, 
  ENHANCED_RECOMMENDATION_PROMPTS 
} from './prompts/recommendation.prompts';
import { 
  WorkoutFocusArea, 
  EquipmentType, 
  UserProfile 
} from '../../types/core';
import { AIInsight } from '../../types/ai';

export class OpenAIRecommendationEngine {
  private openAIService: OpenAIService;
  private config = getOpenAIConfig();

  constructor(openAIService?: OpenAIService) {
    this.openAIService = openAIService || new OpenAIService();
  }

  /**
   * Generate enhanced recommendations using OpenAI
   */
  async generateEnhancedRecommendations(
    request: OpenAIRecommendationRequest
  ): Promise<EnhancedRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(request);
      
      const response = await this.openAIService.generateChatCompletion({
        messages: [
          { role: 'system', content: ENHANCED_RECOMMENDATION_PROMPTS.system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const recommendations = this.parseRecommendationResponse(response.content);
      
      return recommendations.map(rec => ({
        ...rec,
        source: 'openai',
        timestamp: new Date().toISOString(),
        confidence: this.calculateConfidence(rec, request)
      }));
    } catch (error) {
      console.error('OpenAI recommendation generation failed:', error);
      return this.getFallbackRecommendations(request);
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
      
      const response = await this.openAIService.generateChatCompletion({
        messages: [
          { role: 'system', content: RECOMMENDATION_PROMPTS.contextual.system },
          { role: 'user', content: contextPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      });

      return this.parseContextualRecommendations(response.content, context);
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
      
      const response = await this.openAIService.generateChatCompletion({
        messages: [
          { role: 'system', content: RECOMMENDATION_PROMPTS.preference.system },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      return this.parsePreferenceAnalysis(response.content);
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
      
      const response = await this.openAIService.generateChatCompletion({
        messages: [
          { role: 'system', content: RECOMMENDATION_PROMPTS.quick.system },
          { role: 'user', content: quickPrompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      return this.parseQuickRecommendations(response.content);
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
- Available Time: ${userProfile.timeCommitment} minutes
- Equipment: ${userProfile.equipment.join(', ')}

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
Provide contextual recommendations for: ${context.scenario}

User Context:
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Constraints: ${context.constraints?.join(', ') || 'None'}
- Special Considerations: ${context.specialConsiderations || 'None'}

Focus on ${context.focusArea} with emphasis on ${context.priority}.
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
- Equipment: ${equipment.join(', ') || 'None'}

Provide 2-3 immediate, practical workout suggestions optimized for these constraints.
    `.trim();
  }

  /**
   * Parse recommendation response from OpenAI
   */
  private parseRecommendationResponse(content: string): EnhancedRecommendation[] {
    try {
      // Parse structured response or extract recommendations from text
      const recommendations: EnhancedRecommendation[] = [];
      
      const lines = content.split('\n').filter(line => line.trim());
      let currentRec: Partial<EnhancedRecommendation> = {};
      
      for (const line of lines) {
        if (line.startsWith('**') && line.endsWith('**')) {
          // New recommendation title
          if (currentRec.title) {
            recommendations.push(currentRec as EnhancedRecommendation);
          }
          currentRec = { title: line.replace(/\*\*/g, '').trim() };
        } else if (line.startsWith('Reasoning:')) {
          currentRec.reasoning = line.replace('Reasoning:', '').trim();
        } else if (line.startsWith('Benefits:')) {
          currentRec.benefits = line.replace('Benefits:', '').trim().split(',').map(b => b.trim());
        } else if (line.startsWith('Implementation:')) {
          currentRec.implementation = line.replace('Implementation:', '').trim();
        } else if (currentRec.title && !currentRec.reasoning && line.trim()) {
          currentRec.reasoning = line.trim();
        }
      }
      
      if (currentRec.title) {
        recommendations.push(currentRec as EnhancedRecommendation);
      }
      
      return recommendations.map(rec => ({
        title: rec.title || 'Workout Recommendation',
        reasoning: rec.reasoning || 'AI-generated recommendation',
        benefits: rec.benefits || [],
        implementation: rec.implementation || 'Follow standard workout principles',
        category: 'general',
        priority: 'medium',
        source: 'openai',
        timestamp: new Date().toISOString(),
        confidence: 0.8
      }));
    } catch (error) {
      console.error('Failed to parse recommendation response:', error);
      return [];
    }
  }

  /**
   * Parse contextual recommendations
   */
  private parseContextualRecommendations(content: string, context: RecommendationContext): EnhancedRecommendation[] {
    const recommendations = this.parseRecommendationResponse(content);
    return recommendations.map(rec => ({
      ...rec,
      category: context.focusArea || 'contextual',
      priority: context.priority || 'medium'
    }));
  }

  /**
   * Parse preference analysis response
   */
  private parsePreferenceAnalysis(content: string): UserPreferenceAnalysis {
    return {
      workoutStyles: this.extractWorkoutStyles(content),
      optimalTiming: this.extractOptimalTiming(content),
      motivationFactors: this.extractMotivationFactors(content),
      progressionPreferences: this.extractProgressionPreferences(content),
      confidence: 0.75,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Parse quick recommendations
   */
  private parseQuickRecommendations(content: string): EnhancedRecommendation[] {
    const recommendations = this.parseRecommendationResponse(content);
    return recommendations.map(rec => ({
      ...rec,
      category: 'quick',
      priority: 'high'
    }));
  }

  /**
   * Calculate confidence score for recommendation
   */
  private calculateConfidence(recommendation: EnhancedRecommendation, request: OpenAIRecommendationRequest): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on data quality
    if (request.userProfile.fitnessLevel) confidence += 0.1;
    if (request.currentState.energyLevel > 0) confidence += 0.1;
    if (request.preferences.workoutTypes.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Extract workout patterns from history
   */
  private extractWorkoutPatterns(workoutHistory: any[]): string {
    if (!workoutHistory.length) return 'No workout history available';
    
    const patterns = [];
    const avgDuration = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0) / workoutHistory.length;
    if (avgDuration > 0) patterns.push(`Average duration: ${Math.round(avgDuration)} minutes`);
    
    return patterns.join(', ') || 'Limited pattern data';
  }

  /**
   * Extract workout styles from analysis
   */
  private extractWorkoutStyles(content: string): string[] {
    const styles = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('strength') || lowerContent.includes('weight')) styles.push('strength');
    if (lowerContent.includes('cardio') || lowerContent.includes('endurance')) styles.push('cardio');
    if (lowerContent.includes('flexibility') || lowerContent.includes('yoga')) styles.push('flexibility');
    if (lowerContent.includes('hiit') || lowerContent.includes('high intensity')) styles.push('hiit');
    
    return styles.length > 0 ? styles : ['balanced'];
  }

  /**
   * Extract optimal timing from analysis
   */
  private extractOptimalTiming(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('morning')) return 'morning';
    if (lowerContent.includes('evening')) return 'evening';
    if (lowerContent.includes('afternoon')) return 'afternoon';
    
    return 'flexible';
  }

  /**
   * Extract motivation factors from analysis
   */
  private extractMotivationFactors(content: string): string[] {
    const factors = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('variety') || lowerContent.includes('different')) factors.push('variety');
    if (lowerContent.includes('progress') || lowerContent.includes('improvement')) factors.push('progress');
    if (lowerContent.includes('challenge') || lowerContent.includes('difficulty')) factors.push('challenge');
    if (lowerContent.includes('social') || lowerContent.includes('group')) factors.push('social');
    
    return factors.length > 0 ? factors : ['self-improvement'];
  }

  /**
   * Extract progression preferences from analysis
   */
  private extractProgressionPreferences(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('gradual') || lowerContent.includes('steady')) return 'gradual';
    if (lowerContent.includes('aggressive') || lowerContent.includes('fast')) return 'aggressive';
    if (lowerContent.includes('plateau') || lowerContent.includes('maintain')) return 'plateau';
    
    return 'moderate';
  }

  /**
   * Get fallback recommendations when OpenAI fails
   */
  private getFallbackRecommendations(request: OpenAIRecommendationRequest): EnhancedRecommendation[] {
    const { userProfile, currentState } = request;
    
    const recommendations: EnhancedRecommendation[] = [];
    
    // Energy-based recommendation
    if (currentState.energyLevel >= 7) {
      recommendations.push({
        title: 'High-Intensity Interval Training',
        reasoning: 'Your high energy level is perfect for challenging HIIT workouts',
        benefits: ['Efficient calorie burn', 'Improved cardiovascular health', 'Time-effective'],
        implementation: 'Alternate between 30 seconds high intensity and 30 seconds rest',
        category: 'cardio',
        priority: 'high',
        source: 'fallback',
        timestamp: new Date().toISOString(),
        confidence: 0.6
      });
    }
    
    // Time-based recommendation
    if (currentState.availableTime <= 15) {
      recommendations.push({
        title: 'Quick Core Blast',
        reasoning: 'Short on time? Core workouts deliver maximum results in minimal time',
        benefits: ['Improved posture', 'Better balance', 'Functional strength'],
        implementation: 'Focus on compound movements like planks, mountain climbers, and bicycle crunches',
        category: 'strength',
        priority: 'medium',
        source: 'fallback',
        timestamp: new Date().toISOString(),
        confidence: 0.7
      });
    }
    
    return recommendations;
  }

  /**
   * Get contextual fallback recommendations
   */
  private getContextualFallbacks(context: RecommendationContext): EnhancedRecommendation[] {
    return [{
      title: `${context.focusArea} Focus Session`,
      reasoning: `Targeted workout for ${context.focusArea} based on your current needs`,
      benefits: ['Targeted improvement', 'Efficient training', 'Goal-aligned'],
      implementation: `Focus on exercises that target ${context.focusArea} specifically`,
      category: context.focusArea || 'general',
      priority: context.priority || 'medium',
      source: 'fallback',
      timestamp: new Date().toISOString(),
      confidence: 0.5
    }];
  }

  /**
   * Get fallback preference analysis
   */
  private getFallbackPreferenceAnalysis(userProfile: UserProfile): UserPreferenceAnalysis {
    return {
      workoutStyles: userProfile.goals.includes('strength') ? ['strength'] : ['cardio'],
      optimalTiming: 'flexible',
      motivationFactors: ['progress', 'health'],
      progressionPreferences: userProfile.fitnessLevel === 'new to exercise' ? 'gradual' : 'moderate',
      confidence: 0.5,
      lastUpdated: new Date().toISOString()
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
    const recommendations: EnhancedRecommendation[] = [];
    
    if (energyLevel >= 6 && availableTime >= 20) {
      recommendations.push({
        title: 'Energizing Full Body Workout',
        reasoning: 'Your energy level and available time are perfect for a comprehensive session',
        benefits: ['Full body engagement', 'Energy boost', 'Comprehensive fitness'],
        implementation: 'Combine strength and cardio movements for maximum efficiency',
        category: 'full-body',
        priority: 'high',
        source: 'fallback',
        timestamp: new Date().toISOString(),
        confidence: 0.6
      });
    }
    
    return recommendations;
  }
} 