import { useCallback } from 'react';

type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
};

type ProfileAnalyticsEvent = {
  'profile_step_started': { step: number; title: string };
  'profile_step_completed': { step: number; duration: number };
  'profile_field_changed': { field: string; step: number };
  'profile_validation_error': { field: string; error: string; step: number };
  'profile_completed': { totalTime: number; completionRate: number };
  'profile_abandoned': { step: number; reason?: string };
};

/**
 * Custom hook for tracking analytics events
 * This is a placeholder implementation - replace with your actual analytics service
 */
export const useAnalytics = () => {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // In a real implementation, this would send the event to your analytics service
    // For now, we'll just log it to the console
    console.log('Analytics Event:', event);

    // Example implementation with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata
      });
    }
  }, []);

  const trackProfileEvent = useCallback(<K extends keyof ProfileAnalyticsEvent>(
    eventName: K,
    data: ProfileAnalyticsEvent[K]
  ) => {
    trackEvent({
      category: 'Profile',
      action: eventName,
      metadata: data
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackProfileEvent
  };
};

// Analytics context types
export type AnalyticsContextType = ReturnType<typeof useAnalytics>;

// Helper function to format duration
export const formatDuration = (startTime: number): number => {
  return Math.round((Date.now() - startTime) / 1000); // Duration in seconds
}; 