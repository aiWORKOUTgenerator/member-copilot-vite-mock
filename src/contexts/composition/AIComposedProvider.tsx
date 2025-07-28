import React, { ReactNode } from 'react';
import { AIServiceProvider } from './AIServiceProvider';
import { AIAnalyticsProvider } from './AIAnalyticsProvider';
import { AIFeatureFlagsProvider } from './AIFeatureFlagsProvider';
import { AIHealthProvider } from './AIHealthProvider';

/**
 * Composed provider that combines all AI-related providers
 * 
 * This provider establishes the foundation for context decomposition
 * while maintaining backward compatibility with the existing AIContext.
 * 
 * Provider Order:
 * 1. AIServiceProvider (core service)
 * 2. AIHealthProvider (health monitoring)
 * 3. AIFeatureFlagsProvider (feature flags)
 * 4. AIAnalyticsProvider (analytics)
 */
export const AIComposedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AIServiceProvider>
      <AIHealthProvider>
        <AIFeatureFlagsProvider>
          <AIAnalyticsProvider>
            {children}
          </AIAnalyticsProvider>
        </AIFeatureFlagsProvider>
      </AIHealthProvider>
    </AIServiceProvider>
  );
}; 