// AI Context Composition - Sprint 4B Module Splitting

// Main composition provider
export { AIComposedProvider } from './AIComposedProvider';

// Individual context providers
export { AIServiceProvider, useAIService } from './AIServiceProvider';
export { AIFeatureFlagsProvider, useAIFeatureFlags } from './AIFeatureFlagsProvider';
export { AIAnalyticsProvider, useAIAnalytics } from './AIAnalyticsProvider';
export { AILegacyProvider, useAI } from './AILegacyProvider'; 