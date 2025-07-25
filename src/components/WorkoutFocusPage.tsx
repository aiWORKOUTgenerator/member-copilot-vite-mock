import React, { useState, useEffect } from 'react';
import { PenLine, ChevronLeft, ClipboardList, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from './shared';
import { QuickWorkoutForm } from './quickWorkout/components';
import DetailedWorkoutContainer from '../services/ai/external/features/detailed-workout-setup/components/containers/DetailedWorkoutContainer';
import { PerWorkoutOptions } from '../types/core';
import { AIRecommendationContext } from '../types/ai';

// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';
import { UserProfile, TimePreference, AIAssistanceLevel, RecoveryStatus } from '../types/user';
import { ProfileData } from './Profile/types/profile.types';
import { mapExperienceLevelToFitnessLevel } from '../utils/configUtils';
import { profileTransformers } from '../utils/dataTransformers';

// Helper function to convert ProfileData to UserProfile
const convertProfileDataToUserProfile = (profileData: ProfileData): UserProfile => {
  return profileTransformers.convertProfileToUserProfileSimple(profileData);
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

  // Initialize workoutType when component mounts or initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // If we have initial data, determine the workout type based on the data structure
      // This helps restore the correct workout type when navigating back
      const hasDetailedOptions = initialData.customization_areas || 
                                initialData.customization_equipment || 
                                initialData.customization_soreness;
      
      const workoutType: WorkoutType = hasDetailedOptions ? 'detailed' : 'quick';
      
      // Update parent with the determined workout type
      if (onDataUpdate) {
        onDataUpdate(initialData, workoutType);
        console.log('WorkoutFocusPage: Initialized with workout type', workoutType);
      }
    }
  }, [initialData, onDataUpdate]);

  const handleOptionsChange = (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    
    // Determine workout type based on current view mode
    const currentWorkoutType: WorkoutType = viewMode === 'quick' ? 'quick' : 'detailed';
    
    // Update parent component with both data and workout type
    onDataUpdate?.(newOptions, currentWorkoutType);
    
    // Log for debugging
    console.log('WorkoutFocusPage: Updated options and workout type', {
      key,
      value,
      workoutType: currentWorkoutType,
      totalOptions: Object.keys(newOptions).length
    });
  };

  // Create AI context with real data
  const aiContext: AIRecommendationContext = {
    currentSelections: options,
    userProfile: profileData ? convertProfileDataToUserProfile(profileData) : {
      fitnessLevel: 'intermediate',
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
              onClick={() => {
                setViewMode('quick');
                // Initialize with quick workout type
                if (onDataUpdate) {
                  onDataUpdate(options, 'quick');
                }
              }}
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
              onClick={() => {
                setViewMode('detailed');
                // Initialize with detailed workout type
                if (onDataUpdate) {
                  onDataUpdate(options, 'detailed');
                }
              }}
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
      workoutType="detailed"
    />
  );
};

export default WorkoutFocusPage;