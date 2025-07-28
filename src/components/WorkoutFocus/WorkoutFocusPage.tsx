import React, { useState, useEffect } from 'react';
import { PenLine } from 'lucide-react';
import { PageHeader } from '../shared';
import { QuickWorkoutForm } from '../quickWorkout/components';
import { DetailedWorkoutWizard } from '../DetailedWorkoutWizard';
import WorkoutSelectionCards from './components/WorkoutSelectionCards';
import { PerWorkoutOptions } from '../../types/core';
import { AIRecommendationContext } from '../../types/ai';
import { UserProfile, TimePreference, AIAssistanceLevel, RecoveryStatus } from '../../types/user';
import { ProfileData } from '../Profile/types/profile.types';
import { profileTransformers } from '../../utils/dataTransformers';
import { aiLogger } from '../../services/ai/logging/AILogger';

// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';

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

type ViewMode = 'selection' | 'quick' | 'detailed' | 'exrx' | 'modality' | 'variations';

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
        aiLogger.debug('WorkoutFocusPage: Initialized with workout type', { workoutType });
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
    aiLogger.debug('WorkoutFocusPage: Updated options and workout type', {
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

  const handleQuickWorkoutSelect = () => {
    setViewMode('quick');
    // Initialize with quick workout type
    if (onDataUpdate) {
      onDataUpdate(options, 'quick');
    }
  };

  const handleDetailedWorkoutSelect = () => {
    setViewMode('detailed');
    // Initialize with detailed workout type
    if (onDataUpdate) {
      onDataUpdate(options, 'detailed');
    }
  };

  const handleExRxSelect = () => {
    setViewMode('exrx');
    // Initialize with exrx workout type
    if (onDataUpdate) {
      onDataUpdate(options, 'detailed'); // Use detailed type for now
    }
  };

  const handleModalitySelect = () => {
    setViewMode('modality');
    // Initialize with modality workout type
    if (onDataUpdate) {
      onDataUpdate(options, 'quick'); // Use quick type for now
    }
  };

  const handleIntelligentVariationsSelect = () => {
    setViewMode('variations');
    // Initialize with variations workout type
    if (onDataUpdate) {
      onDataUpdate(options, 'detailed'); // Use detailed type for now
    }
  };

  const handleBackToProfile = () => {
    onNavigate('profile');
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
        <WorkoutSelectionCards
          onQuickWorkoutSelect={handleQuickWorkoutSelect}
          onDetailedWorkoutSelect={handleDetailedWorkoutSelect}
          onExRxSelect={handleExRxSelect}
          onModalitySelect={handleModalitySelect}
          onIntelligentVariationsSelect={handleIntelligentVariationsSelect}
          onBackToProfile={handleBackToProfile}
        />
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

  // Detailed Workout View - Now uses proper wizard flow
  if (viewMode === 'detailed') {
    return (
      <DetailedWorkoutWizard
        onNavigate={onNavigate}
        profileData={profileData || null}
        userProfile={profileData ? convertProfileDataToUserProfile(profileData) : undefined}
        initialData={options}
        onDataUpdate={onDataUpdate}
      />
    );
  }

  // ExRx Workout View - Placeholder for now
  if (viewMode === 'exrx') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ExRx - Exercise Prescription</h2>
          <p className="text-gray-600 mb-8">Medical-grade exercise prescriptions coming soon...</p>
          <button 
            onClick={() => setViewMode('selection')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  // Modality Workout View - Placeholder for now
  if (viewMode === 'modality') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Workout Modalities</h2>
          <p className="text-gray-600 mb-8">Activity-based workout selection coming soon...</p>
          <button 
            onClick={() => setViewMode('selection')}
            className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-all duration-300"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  // Intelligent Variations View - Placeholder for now
  if (viewMode === 'variations') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Variations</h2>
          <p className="text-gray-600 mb-8">AI-powered workout variations coming soon...</p>
          <button 
            onClick={() => setViewMode('selection')}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all duration-300"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }
};

export default WorkoutFocusPage; 