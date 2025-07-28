import { featureFlagService } from '../services/ai/featureFlags/FeatureFlagService';
import type { ProfileData } from '../types/profile.types';
import { aiLogger } from '../services/ai/logging/AILogger';

// Import types from App.tsx
import type { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import type { PerWorkoutOptions } from '../types/core';
import type { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';

// Define AppState locally to match App.tsx
type WorkoutType = 'quick' | 'detailed';
type PageType = 'profile' | 'waiver' | 'focus' | 'review' | 'results' | 'devtools';

interface AppState {
  profileData: ProfileData | null;
  waiverData: LiabilityWaiverData | null;
  workoutFocusData: PerWorkoutOptions | null;
  workoutType: WorkoutType | null;
  generatedWorkout: GeneratedWorkout | null;
}

/**
 * Utility functions for determining the initial page based on app state and feature flags
 */

/**
 * Check if profile data is complete and valid
 */
export const isProfileComplete = (profileData: ProfileData | null): boolean => {
  if (!profileData) return false;
  
  return !!(
    profileData.experienceLevel && 
    profileData.primaryGoal &&
    profileData.preferredActivities &&
    Array.isArray(profileData.preferredActivities) &&
    profileData.preferredActivities.length > 0
  );
};

/**
 * Check if waiver data is complete - aligned with actual form validation
 */
export const isWaiverComplete = (waiverData: any): boolean => {
  if (!waiverData) return false;
  
  // Step 1: Only requires physicianApproval (other fields are optional)
  const step1Complete = waiverData.physicianApproval === true;
  
  // Step 2: All 4 boolean fields must be true
  const step2Complete = !!(
    waiverData.understandRisks &&
    waiverData.assumeResponsibility &&
    waiverData.followInstructions &&
    waiverData.reportInjuries
  );
  
  // Step 3: Release, signature, and date must be filled
  const step3Complete = !!(
    waiverData.releaseFromLiability &&
    waiverData.signature &&
    waiverData.signatureDate
  );
  
  // All 3 steps must be complete
  return step1Complete && step2Complete && step3Complete;
};

/**
 * Check if user has completed the initial onboarding flow
 */
export const hasCompletedOnboarding = (): boolean => {
  try {
    return localStorage.getItem('hasCompletedInitialFlow') === 'true';
  } catch (error) {
    aiLogger.warn('Failed to check onboarding completion status', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
};

/**
 * Mark onboarding as complete
 */
export const markOnboardingComplete = (): void => {
  try {
    localStorage.setItem('hasCompletedInitialFlow', 'true');
    aiLogger.info('Onboarding marked as complete');
  } catch (error) {
    aiLogger.error('Failed to mark onboarding as complete', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

/**
 * Determine the initial page based on app state and feature flags
 */
export const determineInitialPage = async (appState: AppState): Promise<PageType> => {
  try {
    // Check if user has completed onboarding
    const onboardingCompleted = hasCompletedOnboarding();
    
    // If onboarding is completed, check feature flag for skipping
    if (onboardingCompleted && appState.profileData) {
      try {
        // Create a minimal user profile for feature flag evaluation
        const userProfile = {
          fitnessLevel: appState.profileData.experienceLevel,
          goals: [appState.profileData.primaryGoal],
          preferences: {
            workoutStyle: appState.profileData.preferredActivities,
            advancedFeatures: true // Assume returning users are power users
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 10 // Assume some workout history
          }
        };
        
        // Evaluate the skip onboarding feature flag
        const shouldSkipOnboarding = featureFlagService.isEnabled('skip-onboarding-flow', userProfile);
        
        aiLogger.info('Feature flag evaluation for skip onboarding', {
          flagId: 'skip-onboarding-flow',
          shouldSkip: shouldSkipOnboarding,
          onboardingCompleted,
          hasProfileData: !!appState.profileData
        });
        
        if (shouldSkipOnboarding) {
          aiLogger.info('Skipping onboarding flow - navigating to focus page');
          return 'focus';
        }
      } catch (error) {
        aiLogger.warn('Feature flag evaluation failed, falling back to standard flow', {
          error: error instanceof Error ? error.message : String(error)
        });
        // Fall back to standard flow if feature flag evaluation fails
      }
    }
    
    // Standard flow determination
    if (!isProfileComplete(appState.profileData)) {
      aiLogger.info('Profile incomplete - navigating to profile page', {
        hasProfileData: !!appState.profileData,
        profileFields: appState.profileData ? Object.keys(appState.profileData) : []
      });
      return 'profile';
    }
    
    if (!isWaiverComplete(appState.waiverData)) {
      // Debug waiver validation step by step
      const waiverData = appState.waiverData;
      const step1Complete = waiverData?.physicianApproval === true;
      const step2Complete = !!(waiverData?.understandRisks && waiverData?.assumeResponsibility && waiverData?.followInstructions && waiverData?.reportInjuries);
      const step3Complete = !!(waiverData?.releaseFromLiability && waiverData?.signature && waiverData?.signatureDate);
      
      aiLogger.info('Waiver incomplete - navigating to waiver page', {
        hasWaiverData: !!appState.waiverData,
        waiverFields: appState.waiverData ? Object.keys(appState.waiverData) : [],
        step1Complete,
        step2Complete,
        step3Complete,
        physicianApproval: waiverData?.physicianApproval,
        understandRisks: waiverData?.understandRisks,
        assumeResponsibility: waiverData?.assumeResponsibility,
        followInstructions: waiverData?.followInstructions,
        reportInjuries: waiverData?.reportInjuries,
        releaseFromLiability: waiverData?.releaseFromLiability,
        signature: waiverData?.signature ? 'filled' : 'empty',
        signatureDate: waiverData?.signatureDate
      });
      return 'waiver';
    }
    
    aiLogger.info('All onboarding complete - navigating to focus page', {
      profileComplete: isProfileComplete(appState.profileData),
      waiverComplete: isWaiverComplete(appState.waiverData)
    });
    return 'focus';
    
  } catch (error) {
    aiLogger.error('Error determining initial page, defaulting to profile', {
      error: error instanceof Error ? error.message : String(error)
    });
    return 'profile';
  }
};

/**
 * Get user groups for feature flag targeting
 */
export const getUserGroups = (profileData: ProfileData | null): string[] => {
  const groups: string[] = [];
  
  if (!profileData) return groups;
  
  // Add groups based on user characteristics
  if (profileData.experienceLevel) {
    groups.push(`fitness_${profileData.experienceLevel.toLowerCase().replace(/\s+/g, '_')}`);
  }
  
  if (profileData.primaryGoal) {
    groups.push(`goal_${profileData.primaryGoal.toLowerCase().replace(/\s+/g, '_')}`);
  }
  
  // Add returning user group if onboarding is completed
  if (hasCompletedOnboarding()) {
    groups.push('returning_users');
  }
  
  // Add power user group for users with advanced preferences
  if (profileData.preferredActivities && profileData.preferredActivities.length > 3) {
    groups.push('power_users');
  }
  
  return groups;
}; 