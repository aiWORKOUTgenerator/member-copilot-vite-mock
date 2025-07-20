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
import { PerWorkoutOptions, WorkoutType } from './types/enhanced-workout-types';
import { UserProfile, FitnessLevel, IntensityLevel } from './types/user';
import { ProfileData } from './components/Profile/types/profile.types';
import { LiabilityWaiverData } from './components/LiabilityWaiver/types/liability-waiver.types';
import { mapExperienceLevelToFitnessLevel } from './utils/configUtils';

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
    try {
      const profileData = localStorage.getItem('profileData');
      if (profileData) {
        const parsed = JSON.parse(profileData);
        if (parsed.data) {
          setAppState(prev => ({
            ...prev,
            profileData: parsed.data
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load profile data from localStorage:', error);
    }
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

        // Use calculated fitness level if available, otherwise fall back to mapping
        const fitnessLevel = appState.profileData.calculatedFitnessLevel || mapExperienceLevelToFitnessLevel(appState.profileData.experienceLevel);
        console.log('✅ App.tsx: Fitness level (calculated/fallback):', fitnessLevel);

        // Convert primary goal
        const primaryGoal = appState.profileData.primaryGoal?.toLowerCase().replace(/\s+/g, '_') || 'general_fitness';
        console.log('✅ App.tsx: Primary goal converted:', primaryGoal);

        // Convert preferred activities
        const workoutStyle = (appState.profileData.preferredActivities || []).map(activity => 
          activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
        );
        console.log('✅ App.tsx: Workout style converted:', workoutStyle);

        // Convert intensity level
        let intensityLevel = (appState.profileData.intensityLevel || 'moderate').toLowerCase();
        if (!['low', 'moderate', 'high'].includes(intensityLevel)) {
          console.warn('⚠️ App.tsx: Invalid intensity level:', intensityLevel, 'using moderate as fallback');
          intensityLevel = 'moderate';
        }
        console.log('✅ App.tsx: Intensity level converted:', intensityLevel);

        // Convert age from string range to numeric (use middle of range)
        let age: number | undefined;
        if (appState.profileData.age) {
          const ageRange = appState.profileData.age.split('-');
          if (ageRange.length === 2) {
            age = Math.floor((parseInt(ageRange[0]) + parseInt(ageRange[1])) / 2);
          } else if (ageRange[0] === '65+') {
            age = 70; // Default for 65+
          }
        }

        // Convert height and weight to numbers if present
        let height: number | undefined;
        let weight: number | undefined;
        
        if (appState.profileData.height) {
          // Handle both imperial and metric formats
          const heightStr = appState.profileData.height.toLowerCase();
          if (heightStr.includes("'") && heightStr.includes('"')) {
            // Imperial format: 5'8" -> convert to cm
            const match = heightStr.match(/(\d+)'(\d+)"/);
            if (match) {
              const feet = parseInt(match[1]);
              const inches = parseInt(match[2]);
              height = Math.round((feet * 12 + inches) * 2.54);
            }
          } else if (heightStr.includes('cm')) {
            // Metric format: 173cm
            const match = heightStr.match(/(\d+)cm/);
            if (match) {
              height = parseInt(match[1]);
            }
          }
        }

        if (appState.profileData.weight) {
          // Handle both imperial and metric formats
          const weightStr = appState.profileData.weight.toLowerCase();
          if (weightStr.includes('lbs') || weightStr.includes('lb')) {
            // Imperial format: 150 lbs -> convert to kg
            const match = weightStr.match(/(\d+)\s*lbs?/);
            if (match) {
              weight = Math.round(parseInt(match[1]) * 0.453592);
            }
          } else if (weightStr.includes('kg')) {
            // Metric format: 68 kg
            const match = weightStr.match(/(\d+)\s*kg/);
            if (match) {
              weight = parseInt(match[1]);
            }
          }
        }

        const userProfile: UserProfile = {
          fitnessLevel,
          goals: [primaryGoal],
          preferences: {
            workoutStyle,
            timePreference: 'morning',
            intensityPreference: intensityLevel as IntensityLevel,
            advancedFeatures: appState.profileData.experienceLevel === 'Advanced Athlete',
            aiAssistanceLevel: 'moderate'
          },
          basicLimitations: {
            injuries: (appState.profileData.injuries || []).filter(injury => injury !== 'No Injuries'),
            availableEquipment: appState.profileData.availableEquipment || [],
            availableLocations: appState.profileData.availableLocations || []
          },
          enhancedLimitations: {
            timeConstraints: appState.profileData.preferredDuration ? 
              parseInt(appState.profileData.preferredDuration.split('-')[1]) || 60 : 60,
            equipmentConstraints: [],
            locationConstraints: [],
            recoveryNeeds: {
              restDays: 2,
              sleepHours: 7,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'moderate'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 0,
            averageDuration: appState.profileData.preferredDuration ? 
              parseInt(appState.profileData.preferredDuration.split('-')[0]) || 30 : 30,
            preferredFocusAreas: [],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.7,
            consistencyScore: 0.5,
            plateauRisk: 'low'
          },
          learningProfile: {
            prefersSimplicity: appState.profileData.experienceLevel === 'New to Exercise',
            explorationTendency: 'moderate',
            feedbackPreference: 'simple',
            learningStyle: 'visual',
            motivationType: 'intrinsic',
            adaptationSpeed: 'moderate'
          },
          // Add optional personal metrics
          age,
          height,
          weight,
          gender: appState.profileData.gender
        };

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
  }, [appState.profileData, initialize, serviceStatus]);

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