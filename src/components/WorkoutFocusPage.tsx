import React, { useState } from 'react';
import { PenLine, ChevronLeft, ClipboardList, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from './shared';
import { QuickWorkoutForm } from './quickWorkout/components';
import DetailedWorkoutContainer from './DetailedWorkoutContainer';
import { PerWorkoutOptions, AIRecommendationContext, WorkoutType } from '../types/enhanced-workout-types';
import { UserProfile, TimePreference, AIAssistanceLevel, RecoveryStatus } from '../types/user';
import { ProfileData } from './Profile/types/profile.types';
import { mapExperienceLevelToFitnessLevel } from '../utils/configUtils';

// Helper function to convert ProfileData to UserProfile
const convertProfileDataToUserProfile = (profileData: ProfileData): UserProfile => {
  return {
    fitnessLevel: mapExperienceLevelToFitnessLevel(profileData.experienceLevel),
    goals: [profileData.primaryGoal.toLowerCase().replace(' ', '_')],
    preferences: {
      workoutStyle: profileData.preferredActivities.map(activity => 
        activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
      ),
      timePreference: 'morning' as TimePreference,
      intensityPreference: (() => {
        // Map target activity level to progression rate (not immediate intensity)
        let targetProgressionRate: 'conservative' | 'moderate' | 'aggressive';
        switch (profileData.intensityLevel) {
          case 'lightly':
          case 'light-moderate':
            targetProgressionRate = 'conservative';
            break;
          case 'moderately':
          case 'active':
            targetProgressionRate = 'moderate';
            break;
          case 'very':
          case 'extremely':
            targetProgressionRate = 'aggressive';
            break;
          default:
            targetProgressionRate = 'moderate';
        }

        // Calculate appropriate starting intensity based on current activity level
        // This ensures safety while working toward the target goal
        switch (profileData.physicalActivity) {
          case 'sedentary':
            // Sedentary users start with low intensity regardless of target
            return 'low';
            
          case 'light':
            // Lightly active users start with low-to-moderate intensity
            return targetProgressionRate === 'aggressive' ? 'moderate' : 'low';
            
          case 'moderate':
            // Moderately active users can start with moderate intensity
            return 'moderate';
            
          case 'very':
            // Very active users can handle moderate-to-high intensity
            return targetProgressionRate === 'conservative' ? 'moderate' : 'high';
            
          case 'extremely':
            // Extremely active users can handle high intensity
            return targetProgressionRate === 'conservative' ? 'moderate' : 'high';
            
          case 'varies':
            // For users with varying activity, use moderate as default
            return 'moderate';
            
          default:
            return 'moderate';
        }
      })(),
      advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
      aiAssistanceLevel: 'moderate' as AIAssistanceLevel
    },
    basicLimitations: {
      injuries: profileData.injuries.filter(injury => injury !== 'No Injuries'),
      availableEquipment: profileData.availableEquipment,
      availableLocations: profileData.availableLocations
    },
    enhancedLimitations: {
      timeConstraints: 0, // Will be calculated by AI service
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
      averageDuration: 45,
      preferredFocusAreas: [],
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.7,
      consistencyScore: 0.5,
      plateauRisk: 'low'
    },
    learningProfile: {
      prefersSimplicity: profileData.experienceLevel === 'New to Exercise',
      explorationTendency: 'moderate',
      feedbackPreference: 'simple',
      learningStyle: 'visual',
      motivationType: 'intrinsic',
      adaptationSpeed: 'moderate'
    }
  };
};

export interface WorkoutFocusPageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  onDataUpdate?: (data: PerWorkoutOptions, workoutType: WorkoutType) => void;
  initialData?: PerWorkoutOptions;
  profileData?: ProfileData | null;
}

type ViewMode = 'selection' | 'quick' | 'detailed';

const WorkoutFocusPage: React.FC<WorkoutFocusPageProps> = ({ 
  onNavigate,
  onDataUpdate,
  initialData,
  profileData 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [options, setOptions] = useState<PerWorkoutOptions>(initialData || {});

  const handleOptionsChange = (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    onDataUpdate?.(newOptions, viewMode === 'quick' ? 'quick' : 'detailed');
  };

  // Create AI context with real data
  const aiContext: AIRecommendationContext = {
    currentSelections: options,
    userProfile: profileData ? convertProfileDataToUserProfile(profileData) : {
      fitnessLevel: 'some experience',
      goals: ['general_fitness'],
      preferences: {
        workoutStyle: ['balanced'],
        timePreference: 'morning' as TimePreference,
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate' as AIAssistanceLevel
      },
      basicLimitations: {
        injuries: [],
        availableEquipment: ['Body Weight'],
        availableLocations: ['Home']
      },
      enhancedLimitations: {
        timeConstraints: 0,
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
        averageDuration: 45,
        preferredFocusAreas: [],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.7,
        consistencyScore: 0.5,
        plateauRisk: 'low'
      },
      learningProfile: {
        prefersSimplicity: true,
        explorationTendency: 'moderate',
        feedbackPreference: 'simple',
        learningStyle: 'visual',
        motivationType: 'intrinsic',
        adaptationSpeed: 'moderate'
      }
    },
    environmentalFactors: {
      timeOfDay: 'morning',
      location: 'home',
      availableTime: 60
    },
    recentActivity: {
      lastWorkoutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastWorkoutType: 'strength',
      recoveryStatus: 'full' as RecoveryStatus
    }
  };

  // Selection View
  if (viewMode === 'selection') {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Choose Your Workout Path"
          subtitle="Select how you'd like to create your workout routine"
          icon={PenLine}
          gradient="from-green-500 to-blue-600"
        />

        {/* Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Workout Card */}
            <div
              onClick={() => setViewMode('quick')}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer group"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Workout Setup</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get a personalized workout in minutes with our streamlined setup process.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Fast and efficient setup
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    AI-powered recommendations
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Basic customization options
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Beginner Friendly
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Detailed Workout Card */}
            <div
              onClick={() => setViewMode('detailed')}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer group"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Workout Focus</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Fine-tune every aspect of your workout with comprehensive customization options for the perfect routine.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Complete workout customization
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Equipment and exercise preferences
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Advanced targeting options
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    Advanced
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Back to Profile Button */}
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => onNavigate('profile')}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Back to Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quick Workout View
  if (viewMode === 'quick') {
    return (
      <QuickWorkoutForm
        onNavigate={onNavigate}
        onBack={() => setViewMode('selection')}
        userProfile={profileData ? convertProfileDataToUserProfile(profileData) : undefined}
        aiContext={aiContext}
        initialData={options}
        onDataUpdate={(data) => onDataUpdate?.(data, 'quick')}
      />
    );
  }

  // Detailed Workout View
  return (
    <DetailedWorkoutContainer
      options={options}
      onChange={handleOptionsChange}
      errors={{}}
      disabled={false}
      onNavigate={onNavigate}
      userProfile={profileData ? convertProfileDataToUserProfile(profileData) : undefined}
      aiContext={aiContext}
      workoutType="detailed"
    />
  );
};

export default WorkoutFocusPage;