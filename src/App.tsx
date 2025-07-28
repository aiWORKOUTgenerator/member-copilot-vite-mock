import React, { useState, useCallback, useEffect } from 'react';
import { User, Shield, Target, Eye, Zap, Settings } from 'lucide-react';
import { ProfilePage, ProfilePageProps } from './components/Profile';
import { LiabilityWaiverPage } from './components/LiabilityWaiver';
import type { LiabilityWaiverPageProps } from './components/LiabilityWaiver/types/liability-waiver.types';
import WorkoutFocusPage from './components/WorkoutFocusPage';
import type WorkoutFocusPageProps from './components/WorkoutFocusPage';
import ReviewPage from './components/ReviewPage';
import type { ReviewPageProps } from './components/ReviewPage';
import WorkoutResultsPage from './components/WorkoutResultsPage';
import type { WorkoutResultsPageProps } from './components/WorkoutResultsPage';
import AIDevToolsDemo from './components/shared/AIDevToolsDemo';
import { AIComposedProvider } from './contexts/composition/AIComposedProvider';
import { EnvironmentValidationBanner } from './components/shared';
import AIContextHealthDashboard from './components/shared/AIContextHealthDashboard';
import { useWorkoutGeneration } from './hooks/useWorkoutGeneration';
import type { UseWorkoutGenerationReturn } from './hooks/useWorkoutGeneration';
import { GeneratedWorkout } from './services/ai/external/types/external-ai.types';
import { PerWorkoutOptions } from './types/core';
import { aiContextRollbackManager } from './services/ai/monitoring/AIContextRollbackManager';
import { aiLogger } from './services/ai/logging/AILogger';
// import { EnvironmentDebug } from './components/shared/EnvironmentDebug'; // REMOVED FOR SECURITY

// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';
import { ProfileData } from './components/Profile/types/profile.types';
import { LiabilityWaiverData } from './components/LiabilityWaiver/types/liability-waiver.types';

import { profileTransformers } from './utils/dataTransformers';

type PageType = 'profile' | 'waiver' | 'focus' | 'review' | 'results' | 'devtools';

// App state for managing data across pages
interface AppState {
  profileData: ProfileData | null;
  waiverData: LiabilityWaiverData | null;
  workoutFocusData: PerWorkoutOptions | null;
  workoutType: WorkoutType | null;
  generatedWorkout: GeneratedWorkout | null;
}

// Define page components with their props
type PageComponents = {
  [K in PageType]: React.ComponentType<{
    onNavigate: (page: PageType, data?: Record<string, unknown>) => void;
    onDataUpdate?: (data: Record<string, unknown>) => void;
    initialData?: Record<string, unknown>;
    profileData?: ProfileData | null;
    waiverData?: LiabilityWaiverData | null;
    workoutFocusData?: PerWorkoutOptions | null;
    workoutType?: WorkoutType | null;
    workoutGeneration?: UseWorkoutGenerationReturn;
    onWorkoutGenerated?: (workout: GeneratedWorkout) => void;
    generatedWorkout?: GeneratedWorkout | null;
    onWorkoutUpdate?: (workout: GeneratedWorkout) => void;
  }>;
};

// Custom hook for AI service initialization
function useAIInitialization(profileData: ProfileData | null) {
  // Start AIContext monitoring system
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      aiContextRollbackManager.startMonitoring();
      aiLogger.info('AIContext monitoring system activated');
    }
  }, []);

  // Initialize AI service when profile data is available
  useEffect(() => {
    const initializeAIService = async () => {
      try {
        // Check if we have profile data
        if (!profileData?.experienceLevel) {
          aiLogger.info('No profile data or experience level, skipping AI initialization');
          return;
        }

        // Validate required profile fields
        if (!profileData.primaryGoal) {
          aiLogger.error({
            error: new Error('Missing primary goal in profile data'),
            context: 'AI service initialization',
            component: 'useAIInitialization',
            severity: 'high',
            userImpact: true
          });
          return;
        }

        // Check for preferred activities with better error handling
        if (!profileData.preferredActivities || profileData.preferredActivities.length === 0) {
          aiLogger.error({
            error: new Error('Missing preferred activities in profile data'),
            context: 'AI service initialization',
            component: 'useAIInitialization',
            severity: 'high',
            userImpact: true
          });
          
          aiLogger.debug('Profile data debug info', {
            hasProfileData: !!profileData,
            profileDataKeys: profileData ? Object.keys(profileData) : 'null',
            preferredActivities: profileData?.preferredActivities,
            preferredActivitiesType: typeof profileData?.preferredActivities,
            isArray: Array.isArray(profileData?.preferredActivities)
          });
          
          // Try to provide a fallback for missing preferred activities
          if (profileData) {
            aiLogger.info('Attempting to provide fallback preferred activities');
            const fallbackActivities: Array<'Walking/Power Walking' | 'Running/Jogging' | 'Swimming' | 'Cycling/Mountain Biking' |
              'Rock Climbing/Bouldering' | 'Yoga' | 'Pilates' | 'Hiking' | 'Dancing' |
              'Team Sports' | 'Golf' | 'Martial Arts'> = ['Walking/Power Walking', 'Yoga'];
            const updatedProfileData = {
              ...profileData,
              preferredActivities: fallbackActivities
            };
            
            // Save to localStorage
            try {
              const existingData = localStorage.getItem('profileData');
              const parsed = existingData ? JSON.parse(existingData) : {};
              const updatedData = {
                ...parsed,
                data: updatedProfileData
              };
              localStorage.setItem('profileData', JSON.stringify(updatedData));
              aiLogger.info('Fallback preferred activities saved');
              
              // Continue with the updated data
              const userProfile = profileTransformers.convertProfileToUserProfileSimple(updatedProfileData);
              
              // Try to initialize AI service if available
              try {
                // Use the AIService directly instead of hooks to avoid circular dependency
                const { AIService } = await import('./services/ai/core/AIService');
                const aiService = new AIService();
                await aiService.setContext({
                  userProfile,
                  currentSelections: {},
                  sessionHistory: [],
                  preferences: {
                    aiAssistanceLevel: 'moderate',
                    showLearningInsights: true,
                    autoApplyLowRiskRecommendations: false
                  }
                });
                aiLogger.info('AI service initialization completed with fallback data');
              } catch (hookError) {
                aiLogger.warn('AI service not available yet, will retry later', { 
                  error: hookError instanceof Error ? hookError.message : String(hookError) 
                });
              }
              return;
            } catch (error) {
              aiLogger.error({
                error: error instanceof Error ? error : new Error(String(error)),
                context: 'fallback data save',
                component: 'useAIInitialization',
                severity: 'medium',
                userImpact: false
              });
              return;
            }
          }
          return;
        }

        aiLogger.info('Profile data validation passed, converting to UserProfile');

        // Use memoized profile conversion to prevent unnecessary conversions
        const userProfile = profileTransformers.convertProfileToUserProfileSimple(profileData);

        aiLogger.info('UserProfile created successfully', {
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals,
          workoutStyle: userProfile.preferences.workoutStyle
        });

        // Try to initialize AI service if available
        try {
          // Use the AIService directly instead of hooks to avoid circular dependency
          const { AIService } = await import('./services/ai/core/AIService');
          const aiService = new AIService();
          aiLogger.info('Calling AI service initialize');
          await aiService.setContext({
            userProfile,
            currentSelections: {},
            sessionHistory: [],
            preferences: {
              aiAssistanceLevel: 'moderate',
              showLearningInsights: true,
              autoApplyLowRiskRecommendations: false
            }
          });
          aiLogger.info('AI service initialization completed successfully');
        } catch (hookError) {
          aiLogger.warn('AI service not available yet, will retry later', { 
            error: hookError instanceof Error ? hookError.message : String(hookError) 
          });
        }

      } catch (error) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'AI service initialization',
          component: 'useAIInitialization',
          severity: 'critical',
          userImpact: true,
          metadata: {
            profileData: profileData ? {
              experienceLevel: profileData.experienceLevel,
              primaryGoal: profileData.primaryGoal,
              preferredActivities: profileData.preferredActivities?.length
            } : 'null'
          }
        });
      }
    };

    // Delay initialization to ensure providers are ready
    const INITIALIZATION_DELAY = 100;
    const timer = setTimeout(initializeAIService, INITIALIZATION_DELAY);
    return () => clearTimeout(timer);
  }, [profileData]);
}

// Separate component for content that needs AI context
function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('profile');
  const [showEnvironmentBanner, setShowEnvironmentBanner] = useState(true);
  const [appState, setAppState] = useState<AppState>(() => {
    // Load initial state from localStorage
    try {
      const profileData = localStorage.getItem('profileData');
      const workoutType = localStorage.getItem('workoutType') as WorkoutType | null;
      
      if (profileData) {
        const parsed = JSON.parse(profileData);
        
        if (parsed.data) { // Check for enhanced persisted state format
          return {
            profileData: parsed.data,
            waiverData: null,
            workoutFocusData: null,
            workoutType: workoutType,
            generatedWorkout: null
          };
        }
      }
    } catch (error) {
      aiLogger.warn('Failed to load profile data from localStorage', { error: error instanceof Error ? error.message : String(error) });
    }
    
    return {
      profileData: null,
      waiverData: null,
      workoutFocusData: null,
      workoutType: null,
      generatedWorkout: null
    };
  });

  // Use AI initialization hook
  useAIInitialization(appState.profileData);

  // Load profile data from localStorage when it changes
  useEffect(() => {
    const loadProfileData = () => {
      try {
        const profileData = localStorage.getItem('profileData');
        
        // 🔍 DEBUG: Log localStorage load (only on changes)
        const previousData = (window as any).previousProfileData;
        const hasChanged = profileData !== previousData;
        if (hasChanged) {
          (window as any).previousProfileData = profileData;
          aiLogger.debug('localStorage changed', {
            hasData: !!profileData
          });
        }
        
        if (profileData) {
          const parsed = JSON.parse(profileData);
          
          // 🔍 DEBUG: Log parsed data structure
          aiLogger.debug('Parsed localStorage data', {
            hasDataProperty: !!parsed.data,
            parsedKeys: Object.keys(parsed),
            dataKeys: parsed.data ? Object.keys(parsed.data) : 'no data property',
            primaryGoal: parsed.data?.primaryGoal,
            experienceLevel: parsed.data?.experienceLevel,
            primaryGoalType: typeof parsed.data?.primaryGoal,
            isValidPrimaryGoal: !!(parsed.data?.primaryGoal && parsed.data.primaryGoal !== '' && parsed.data.primaryGoal !== 'undefined')
          });
          
          if (parsed.data) {
            // Validate that the data is complete before setting it
            const hasRequiredFields = !!(
              parsed.data.experienceLevel && 
              parsed.data.primaryGoal &&
              parsed.data.preferredActivities &&
              Array.isArray(parsed.data.preferredActivities) &&
              parsed.data.preferredActivities.length > 0
            );
            
            aiLogger.debug('Data validation', {
              hasRequiredFields,
              experienceLevel: parsed.data.experienceLevel,
              primaryGoal: parsed.data.primaryGoal,
              preferredActivities: parsed.data.preferredActivities,
              hasPreferredActivities: !!(parsed.data.preferredActivities && Array.isArray(parsed.data.preferredActivities) && parsed.data.preferredActivities.length > 0)
            });
            
            // If data is incomplete, try to provide fallbacks
            if (!hasRequiredFields) {
              aiLogger.warn('Incomplete profile data detected, providing fallbacks');
              const fallbackData = {
                ...parsed.data,
                preferredActivities: parsed.data.preferredActivities && Array.isArray(parsed.data.preferredActivities) && parsed.data.preferredActivities.length > 0
                  ? parsed.data.preferredActivities
                  : ['Walking/Power Walking', 'Yoga'] as Array<'Walking/Power Walking' | 'Running/Jogging' | 'Swimming' | 'Cycling/Mountain Biking' |
                    'Rock Climbing/Bouldering' | 'Yoga' | 'Pilates' | 'Hiking' | 'Dancing' |
                    'Team Sports' | 'Golf' | 'Martial Arts'>,
                availableLocations: parsed.data.availableLocations && Array.isArray(parsed.data.availableLocations) && parsed.data.availableLocations.length > 0
                  ? parsed.data.availableLocations
                  : ['Home'] as Array<'Gym' | 'Home Gym' | 'Home' | 'Parks/Outdoor Spaces' | 'Swimming Pool' | 'Running Track'>,
                availableEquipment: parsed.data.availableEquipment && Array.isArray(parsed.data.availableEquipment) && parsed.data.availableEquipment.length > 0
                  ? parsed.data.availableEquipment
                  : ['Body Weight'] as Array<'Barbells & Weight Plates' | 'Strength Machines' |
                    'Cardio Machines (Treadmill, Elliptical, Bike)' | 'Functional Training Area (Kettlebells, Resistance Bands, TRX)' |
                    'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)' | 'Pool (If available)' |
                    'Dumbbells' | 'Resistance Bands' | 'Kettlebells' |
                    'Cardio Machine (Treadmill, Bike)' | 'Yoga Mat & Stretching Space' |
                    'Body Weight' | 'Yoga Mat' | 'Suspension Trainer/TRX' | 'No equipment required'>
              };
              
              // Save the corrected data back to localStorage
              try {
                const correctedData = {
                  ...parsed,
                  data: fallbackData
                };
                localStorage.setItem('profileData', JSON.stringify(correctedData));
                aiLogger.info('Corrected profile data saved to localStorage');
              } catch (error) {
                aiLogger.error({
                  error: error instanceof Error ? error : new Error(String(error)),
                  context: 'localStorage save',
                  component: 'App.tsx',
                  severity: 'medium',
                  userImpact: false
                });
              }
              
              setAppState(prev => ({
                ...prev,
                profileData: fallbackData
              }));
            } else {
              setAppState(prev => ({
                ...prev,
                profileData: parsed.data
              }));
            }
            
            // 🔍 DEBUG: Log what we're setting in state
            aiLogger.debug('Setting profileData in state', {
              primaryGoal: parsed.data.primaryGoal,
              experienceLevel: parsed.data.experienceLevel,
              hasRequiredFields
            });
          } else {
            aiLogger.warn('No data property found in parsed localStorage');
          }
        } else {
          aiLogger.debug('No profileData found in localStorage');
        }
      } catch (error) {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'localStorage load',
          component: 'App.tsx',
          severity: 'medium',
          userImpact: false
        });
      }
    };

    // Initial load
    loadProfileData();

    // Also listen for storage changes (when user updates profile in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileData') {
        aiLogger.debug('Detected localStorage change, reloading');
        loadProfileData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Workout generation hook - now inside AIProvider context
  const workoutGeneration = useWorkoutGeneration();

  const pages = [
    { id: 'profile' as const, title: 'Profile', icon: User, component: ProfilePage },
    { id: 'waiver' as const, title: 'Waiver', icon: Shield, component: LiabilityWaiverPage },
    { id: 'focus' as const, title: 'Workout Focus', icon: Target, component: WorkoutFocusPage },
    { id: 'review' as const, title: 'Review', icon: Eye, component: ReviewPage },
    { id: 'results' as const, title: 'Results', icon: Zap, component: WorkoutResultsPage },
    ...(process.env.NODE_ENV === 'development' ? [
      { id: 'devtools' as const, title: 'AIDevTools', icon: Settings, component: AIDevToolsDemo }
    ] : [])
  ];

  const currentPageIndex = pages.findIndex(page => page.id === currentPage);
  const CurrentPageComponent = pages[currentPageIndex].component as PageComponents[typeof currentPage];

  // Navigation handler with data persistence
  const handleNavigation = useCallback((page: PageType, data?: Record<string, unknown>) => {
    // Save any data passed with navigation
    if (data) {
      setAppState(prev => ({ ...prev, ...data }));
    }
    
    setCurrentPage(page);
  }, []);

  // Update app state handlers
  const updateProfileData = useCallback((profileData: ProfileData) => {
    // Update app state
    setAppState(prev => ({ ...prev, profileData }));

    // Log the profile data being saved
    aiLogger.info('Saving profile data', { profileData });

    // Verify the data in localStorage
    const stored = localStorage.getItem('profileData');
    if (stored) {
      const parsed = JSON.parse(stored);
      aiLogger.debug('Current localStorage data', { parsed });
    }
  }, []);

  const updateWaiverData = useCallback((waiverData: LiabilityWaiverData) => {
    setAppState(prev => ({ ...prev, waiverData }));
  }, []);

  const updateWorkoutFocusData = useCallback((workoutFocusData: PerWorkoutOptions, workoutType: WorkoutType) => {
    aiLogger.debug('updateWorkoutFocusData called', { 
      workoutType, 
      intensity: workoutFocusData.customization_intensity,
      totalKeys: Object.keys(workoutFocusData).length 
    });
    
    setAppState(prev => {
      aiLogger.debug('setAppState called with prev state', {
        hasProfileData: !!prev.profileData,
        hasWorkoutFocusData: !!prev.workoutFocusData,
        currentWorkoutType: prev.workoutType
      });
      
      return { ...prev, workoutFocusData, workoutType };
    });
    
    // Persist workoutType to localStorage
    try {
      localStorage.setItem('workoutType', workoutType);
      aiLogger.info('Saving workoutType to localStorage', { workoutType });
    } catch (error) {
      aiLogger.warn('Failed to save workoutType to localStorage', { error: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  const updateGeneratedWorkout = useCallback((generatedWorkout: GeneratedWorkout) => {
    setAppState(prev => ({ ...prev, generatedWorkout }));
  }, []);

  // Get page-specific props
  const getPageProps = useCallback(() => {
    const baseProps = {
      onNavigate: handleNavigation,
    };

    switch (currentPage) {
      case 'profile':
        return {
          ...baseProps,
          onDataUpdate: updateProfileData,
          initialData: appState.profileData
        } as ProfilePageProps;
      
      case 'waiver':
        return {
          ...baseProps,
          onDataUpdate: updateWaiverData,
          initialData: appState.waiverData
        } as LiabilityWaiverPageProps;
      
      case 'focus':
        return {
          ...baseProps,
          onDataUpdate: updateWorkoutFocusData,
          initialData: appState.workoutFocusData,
          profileData: appState.profileData
        } as WorkoutFocusPageProps;
      
      case 'review':
        // 🔍 DEBUG: Log what's being passed to ReviewPage (key fields only)
        if (appState.profileData) {
          aiLogger.debug('ReviewPage data', {
            primaryGoal: appState.profileData.primaryGoal,
            experienceLevel: appState.profileData.experienceLevel
          });
        }
        return {
          ...baseProps,
          profileData: appState.profileData,
          waiverData: appState.waiverData,
          workoutFocusData: appState.workoutFocusData,
          workoutType: appState.workoutType,
          workoutGeneration,
          onWorkoutGenerated: updateGeneratedWorkout
        } as ReviewPageProps;
      
      case 'results':
        // 🔍 DEBUG: Log what's being passed to WorkoutResultsPage
        aiLogger.debug('WorkoutResultsPage props', {
          hasGeneratedWorkout: !!appState.generatedWorkout,
          workoutId: appState.generatedWorkout?.id,
          workoutTitle: appState.generatedWorkout?.title,
          workoutKeys: appState.generatedWorkout ? Object.keys(appState.generatedWorkout) : 'N/A'
        });
        return {
          ...baseProps,
          generatedWorkout: appState.generatedWorkout,
          workoutGeneration,
          onWorkoutUpdate: updateGeneratedWorkout
        } as WorkoutResultsPageProps;
      
      case 'devtools':
        return baseProps;
      
      default:
        return baseProps;
    }
  }, [currentPage, appState, handleNavigation, workoutGeneration, updateProfileData, updateWaiverData, updateWorkoutFocusData, updateGeneratedWorkout]);

  // Type assertion for CurrentPageComponent
  const TypedCurrentPageComponent = CurrentPageComponent as React.ComponentType<ReturnType<typeof getPageProps>>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Environment Validation Banner */}
      {showEnvironmentBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <EnvironmentValidationBanner
            environmentStatus={{
              isConfigured: false,
              hasApiKey: false,
              isDevelopment: process.env.NODE_ENV === 'development',
              issues: [],
              recommendations: []
            }}
            onDismiss={() => setShowEnvironmentBanner(false)}
            showInDevelopment={true}
          />
        </div>
      )}
      
      {/* Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {pages.map((page) => {
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id as PageType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <page.icon className="w-4 h-4" />
                  <span>{page.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-500 ease-in-out">
          <TypedCurrentPageComponent {...getPageProps()} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            © 2025 Fitcopilot. All rights reserved.
          </p>
        </div>
      </footer>
      {/* AIContext Health Dashboard (development only) */}
      <AIContextHealthDashboard isVisible={process.env.NODE_ENV === 'development'} />
      
      {/* Environment Debug (temporary) - REMOVED FOR SECURITY */}
    </div>
  );
}

// Main App component
function App() {
  return (
    <AIComposedProvider>
      <AppContent />
    </AIComposedProvider>
  );
}

export default App;