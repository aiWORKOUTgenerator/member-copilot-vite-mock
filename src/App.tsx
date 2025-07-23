import React, { useState, useCallback, useEffect } from 'react';
import { User, Shield, Target, Eye, Zap, ChevronRight } from 'lucide-react';
import { ProfilePage, ProfilePageProps } from './components/Profile';
import { LiabilityWaiverPage } from './components/LiabilityWaiver';
import type { LiabilityWaiverPageProps } from './components/LiabilityWaiver/types/liability-waiver.types';
import WorkoutFocusPage from './components/WorkoutFocusPage';
import type { WorkoutFocusPageProps } from './components/WorkoutFocusPage';
import ReviewPage from './components/ReviewPage';
import type { ReviewPageProps } from './components/ReviewPage';
import WorkoutResultsPage from './components/WorkoutResultsPage';
import type { WorkoutResultsPageProps } from './components/WorkoutResultsPage';
import { AIProvider, AIDevTools, useAI } from './contexts/AIContext';
import { EnvironmentValidationBanner } from './components/shared';
import { useWorkoutGeneration } from './hooks/useWorkoutGeneration';
import type { UseWorkoutGenerationReturn } from './hooks/useWorkoutGeneration';
import { GeneratedWorkout } from './services/ai/external/types/external-ai.types';
import { PerWorkoutOptions } from './types/core';

// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';
import { ProfileData } from './components/Profile/types/profile.types';
import { LiabilityWaiverData } from './components/LiabilityWaiver/types/liability-waiver.types';

import { profileTransformers } from './utils/dataTransformers';

type PageType = 'profile' | 'waiver' | 'focus' | 'review' | 'results';

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
    onNavigate: (page: PageType, data?: any) => void;
    onDataUpdate?: (data: any) => void;
    initialData?: any;
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
      console.warn('Failed to load profile data from localStorage:', error);
    }
    
    return {
      profileData: null,
      waiverData: null,
      workoutFocusData: null,
      workoutType: null,
      generatedWorkout: null
    };
  });

  // AI service initialization
  const { initialize, serviceStatus } = useAI();

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
          console.log('🔍 App.tsx - localStorage changed:', {
            hasData: !!profileData
          });
        }
        
        if (profileData) {
          const parsed = JSON.parse(profileData);
          
          // 🔍 DEBUG: Log parsed data structure
          console.log('🔍 App.tsx - Parsed localStorage data:', {
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
            const hasRequiredFields = !!(parsed.data.experienceLevel && parsed.data.primaryGoal);
            
            console.log('🔍 App.tsx - Data validation:', {
              hasRequiredFields,
              experienceLevel: parsed.data.experienceLevel,
              primaryGoal: parsed.data.primaryGoal
            });
            
            setAppState(prev => ({
              ...prev,
              profileData: parsed.data
            }));
            
            // 🔍 DEBUG: Log what we're setting in state
            console.log('🔍 App.tsx - Setting profileData in state:', {
              primaryGoal: parsed.data.primaryGoal,
              experienceLevel: parsed.data.experienceLevel,
              hasRequiredFields
            });
          } else {
            console.warn('🔍 App.tsx - No data property found in parsed localStorage');
          }
        } else {
          console.log('🔍 App.tsx - No profileData found in localStorage');
        }
      } catch (error) {
        console.error('Failed to load profile data from localStorage:', error);
      }
    };

    // Initial load
    loadProfileData();

    // Also listen for storage changes (when user updates profile in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileData') {
        console.log('🔍 App.tsx - Detected localStorage change, reloading...');
        loadProfileData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Initialize AI service when profile data is available
  useEffect(() => {
    const initializeAIService = async () => {
      try {
        console.log('🔄 App.tsx: Checking AI service initialization conditions...', {
          hasProfileData: !!appState.profileData,
          experienceLevel: appState.profileData?.experienceLevel,
          serviceStatus,
          hasRequiredFields: !!(appState.profileData?.experienceLevel && appState.profileData?.primaryGoal)
        });

        if (!appState.profileData?.experienceLevel) {
          console.log('ℹ️ App.tsx: No profile data or experience level, skipping AI initialization');
          return;
        }

        if (serviceStatus === 'ready') {
          console.log('ℹ️ App.tsx: AI service already ready, skipping initialization');
          return;
        }

        if (serviceStatus === 'error') {
          console.log('⚠️ App.tsx: AI service in error state, attempting re-initialization');
        }

        // Validate required profile fields
        if (!appState.profileData.primaryGoal) {
          console.error('❌ App.tsx: Missing primary goal in profile data');
          return;
        }

        if (!appState.profileData.preferredActivities || appState.profileData.preferredActivities.length === 0) {
          console.error('❌ App.tsx: Missing preferred activities in profile data');
          return;
        }

        console.log('✅ App.tsx: Profile data validation passed, converting to UserProfile...');

        // Use memoized profile conversion to prevent unnecessary conversions
        const userProfile = profileTransformers.convertProfileToUserProfileSimple(appState.profileData);

        console.log('✅ App.tsx: UserProfile created successfully:', {
          fitnessLevel: userProfile.fitnessLevel,
          goals: userProfile.goals,
          workoutStyle: userProfile.preferences.workoutStyle
        });

        console.log('🔄 App.tsx: Calling AI service initialize...');
        await initialize(userProfile);
        console.log('✅ App.tsx: AI service initialization completed successfully');

      } catch (error) {
        console.error('❌ App.tsx: Failed to initialize AI service:', error);
        console.error('App.tsx: Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          profileData: appState.profileData ? {
            experienceLevel: appState.profileData.experienceLevel,
            primaryGoal: appState.profileData.primaryGoal,
            preferredActivities: appState.profileData.preferredActivities?.length
          } : 'null'
        });
      }
    };

    initializeAIService();
  }, [appState.profileData, serviceStatus]);

  // Workout generation hook - now inside AIProvider context
  const workoutGeneration = useWorkoutGeneration();

  const pages = [
    { id: 'profile' as const, title: 'Profile', icon: User, component: ProfilePage },
    { id: 'waiver' as const, title: 'Waiver', icon: Shield, component: LiabilityWaiverPage },
    { id: 'focus' as const, title: 'Workout Focus', icon: Target, component: WorkoutFocusPage },
    { id: 'review' as const, title: 'Review', icon: Eye, component: ReviewPage },
    { id: 'results' as const, title: 'Results', icon: Zap, component: WorkoutResultsPage }
  ];

  const currentPageIndex = pages.findIndex(page => page.id === currentPage);
  const CurrentPageComponent = pages[currentPageIndex].component as PageComponents[typeof currentPage];

  // Navigation handler with data persistence
  const handleNavigation = useCallback((page: PageType, data?: any) => {
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
    console.log('Saving profile data:', profileData);

    // Verify the data in localStorage
    const stored = localStorage.getItem('profileData');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Current localStorage data:', parsed);
    }
  }, []);

  const updateWaiverData = useCallback((waiverData: LiabilityWaiverData) => {
    setAppState(prev => ({ ...prev, waiverData }));
  }, []);

  const updateWorkoutFocusData = useCallback((workoutFocusData: PerWorkoutOptions, workoutType: WorkoutType) => {
    setAppState(prev => ({ ...prev, workoutFocusData, workoutType }));
    
    // Persist workoutType to localStorage
    try {
      localStorage.setItem('workoutType', workoutType);
      console.log('Saving workoutType to localStorage:', workoutType);
    } catch (error) {
      console.warn('Failed to save workoutType to localStorage:', error);
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
          console.log('🔍 App.tsx - ReviewPage data:', {
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
        console.log('🔍 App.tsx - WorkoutResultsPage props:', {
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
      
      default:
        return baseProps;
    }
  }, [currentPage, appState, handleNavigation, workoutGeneration, updateProfileData, updateWaiverData, updateWorkoutFocusData, updateGeneratedWorkout]);

  // Type assertion for CurrentPageComponent
  const TypedCurrentPageComponent = CurrentPageComponent as React.ComponentType<ReturnType<typeof getPageProps>>;

  // Get AI context for environment validation
  const { environmentStatus } = useAI();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Environment Validation Banner */}
      {showEnvironmentBanner && environmentStatus.issues.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <EnvironmentValidationBanner
            environmentStatus={environmentStatus}
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
            © 2024 Your Workout App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main App component
function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}

export default App;