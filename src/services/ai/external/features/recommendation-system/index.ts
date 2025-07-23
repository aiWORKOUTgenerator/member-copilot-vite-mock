// Recommendation System Feature - Minimal Organization
// Re-exports for the existing working recommendation system

export * from './prompts/recommendation.prompts';

// Feature metadata
export const RECOMMENDATION_SYSTEM_METADATA = {
  name: 'AI Recommendation System',
  version: '1.0.0',
  description: 'OpenAI-powered personalized fitness recommendations',
  status: 'active',
  integration: 'OpenAIStrategy.generateRecommendations()',
  prompts: {
    enhanced: 'ENHANCED_RECOMMENDATION_PROMPT_TEMPLATE',
    quick: 'QUICK_RECOMMENDATION_PROMPT_TEMPLATE', 
    crossComponent: 'CROSS_COMPONENT_RECOMMENDATION_PROMPT_TEMPLATE',
    progressive: 'PROGRESSIVE_RECOMMENDATION_PROMPT_TEMPLATE'
  },
  selector: 'selectRecommendationPrompt(context, userLevel, complexity)'
}; 