import { OpenAIConfig, ExternalAIServiceConfig } from '../types/external-ai.types';

// Mock environment variables
const mockEnv = {
  VITE_OPENAI_API_KEY: 'mock-api-key',
  VITE_OPENAI_MODEL: 'gpt-3.5-turbo',
  VITE_OPENAI_MAX_TOKENS: '1000',
  VITE_OPENAI_TEMPERATURE: '0.7',
  VITE_OPENAI_BASE_URL: 'https://api.openai.com/v1'
};

export const openAIConfig = (): ExternalAIServiceConfig => ({
  openai: {
    apiKey: mockEnv.VITE_OPENAI_API_KEY,
    model: mockEnv.VITE_OPENAI_MODEL,
    maxTokens: parseInt(mockEnv.VITE_OPENAI_MAX_TOKENS),
    temperature: parseFloat(mockEnv.VITE_OPENAI_TEMPERATURE),
    baseURL: mockEnv.VITE_OPENAI_BASE_URL
  },
  features: {
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true,
    openai_real_time_coaching: true,
    openai_fallback_enabled: true
  },
  performance: {
    maxRequestsPerMinute: 60,
    timeoutMs: 30000,
    retryAttempts: 3,
    cacheTimeoutMs: 3600000
  },
  fallback: {
    enabled: true,
    strategy: 'cached'
  }
});

export const validateConfig = (config: OpenAIConfig): boolean => true;

export const estimateTokenCost = (tokens: number, model: string): number => {
  return tokens * 0.0001; // Mock cost calculation
}; 