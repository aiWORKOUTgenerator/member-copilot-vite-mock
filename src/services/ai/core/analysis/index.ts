// Analysis Engine Components
// Extracted from AIService.ts to provide focused analysis functionality

export { AIServiceAnalyzer } from './AIServiceAnalyzer';
export { AIServiceAnalysisGenerator } from './AIServiceAnalysisGenerator';
export { AIServiceRecommendationEngine } from './AIServiceRecommendationEngine';

// Re-export types for convenience
export type { 
  UnifiedAIAnalysis, 
  CrossComponentConflict, 
  PrioritizedRecommendation,
  GlobalAIContext,
  AIServiceConfig 
} from '../types/AIServiceTypes'; 