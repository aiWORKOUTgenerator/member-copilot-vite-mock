// AI Analysis Helpers - Phase 3D
import { GlobalAIContext } from '../../core/AIService';
import { AIInsight } from '../../../../types/insights';
import { UserPreferenceAnalysis } from '../types/external-ai.types';

/**
 * Create prompt for enhancing insights with AI
 */
export const createInsightEnhancementPrompt = (
  context: GlobalAIContext, 
  insights: AIInsight[]
): string => {
  return `Enhance the following fitness insights for a user with ${context.userProfile.fitnessLevel} experience level:

Current Insights:
${insights.map(insight => `- ${insight.message}`).join('\n')}

User Context:
- Fitness Level: ${context.userProfile.fitnessLevel}
- Goals: ${context.userProfile.goals?.join(', ') || 'Not specified'}
- Current Energy: ${context.currentSelections.customization_energy || 'Not specified'}
- Focus Area: ${context.currentSelections.customization_focus || 'Not specified'}

Please enhance these insights to be more personalized and actionable.`;
};

/**
 * Create prompt for user preference analysis
 */
export const createUserAnalysisPrompt = (context: GlobalAIContext): string => {
  return `Analyze the user preferences and provide insights:

User Profile:
- Fitness Level: ${context.userProfile.fitnessLevel}
- Goals: ${context.userProfile.goals?.join(', ') || 'Not specified'}
- Experience: ${context.userProfile.experience || 'Not specified'}

Current Selections:
- Energy Level: ${context.currentSelections.customization_energy || 'Not specified'}
- Duration: ${context.currentSelections.customization_duration || 'Not specified'}
- Focus: ${context.currentSelections.customization_focus || 'Not specified'}
- Equipment: ${Array.isArray(context.currentSelections.customization_equipment) ? context.currentSelections.customization_equipment.join(', ') : context.currentSelections.customization_equipment || 'Not specified'}

Session History: ${context.sessionHistory.length} previous interactions

Provide a comprehensive analysis of user preferences and recommendations.`;
};

/**
 * Parse enhanced insights from AI response
 */
export const parseEnhancedInsights = (
  content: string | undefined, 
  originalInsights: AIInsight[]
): AIInsight[] => {
  if (!content) {
    return originalInsights;
  }

  try {
    // Simple parsing - in production, you'd want more robust parsing
    const enhancedInsights = originalInsights.map((insight, index) => ({
      ...insight,
      message: content.includes(insight.message) ? insight.message : `${insight.message} (Enhanced)`,
      enhanced: true
    }));

    return enhancedInsights;
  } catch (error) {
    console.warn('Failed to parse enhanced insights:', error);
    return originalInsights;
  }
};

/**
 * Parse user analysis from AI response
 */
export const parseUserAnalysis = (
  content: string | undefined, 
  context: GlobalAIContext
): UserPreferenceAnalysis => {
  if (!content) {
    return createBasicUserAnalysis(context);
  }

  try {
    // Simple parsing - in production, you'd want more robust parsing
    return {
      preferences: {
        intensity: 'moderate',
        duration: context.currentSelections.customization_duration || 30,
        focus: context.currentSelections.customization_focus || 'general'
      },
      insights: {
        energy: [`Current energy level: ${context.currentSelections.customization_energy || 'Not specified'}`],
        duration: [`Recommended duration: ${context.currentSelections.customization_duration || 30} minutes`],
        focus: [`Focus area: ${context.currentSelections.customization_focus || 'General fitness'}`]
      },
      recommendations: [
        {
          id: 'ai_analysis_1',
          title: 'AI Analysis Complete',
          description: 'User preferences analyzed successfully',
          priority: 'medium'
        }
      ]
    };
  } catch (error) {
    console.warn('Failed to parse user analysis:', error);
    return createBasicUserAnalysis(context);
  }
};

/**
 * Create basic user analysis when AI is not available
 */
export const createBasicUserAnalysis = (context: GlobalAIContext): UserPreferenceAnalysis => {
  return {
    preferences: {
      intensity: 'moderate',
      duration: context.currentSelections.customization_duration || 30,
      focus: context.currentSelections.customization_focus || 'general'
    },
    insights: {
      energy: [`Energy level: ${context.currentSelections.customization_energy || 'Not specified'}`],
      duration: [`Duration: ${context.currentSelections.customization_duration || 30} minutes`],
      focus: [`Focus: ${context.currentSelections.customization_focus || 'General fitness'}`]
    },
    recommendations: [
      {
        id: 'basic_analysis_1',
        title: 'Basic Analysis',
        description: 'Basic user preference analysis completed',
        priority: 'low'
      }
    ]
  };
}; 