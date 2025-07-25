import React, { useState, useCallback } from 'react';
import { Eye, ChevronLeft, ChevronRight, AlertTriangle, XCircle, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { WorkoutGenerationRequest } from '../../types/workout-generation.types';
import { UserProfile } from '../../types/user';
import { mapExperienceLevelToFitnessLevel } from '../../utils/configUtils';
import { calculateWorkoutIntensity } from '../../utils/fitnessLevelCalculator';
import { ReviewPageProps } from './types';
import { ProfileSection, WorkoutSection, DetailedWorkoutSection } from './sections';
import { 
  convertWorkoutFocusToDisplay, 
  validateWorkoutFocusData, 
  validateDetailedWorkoutProgression
} from './utils';
import { ValidationService } from './utils/validationService';
import { ValidationFeedbackPanel, ErrorHandlingPanel, ErrorTemplates } from '../shared';

export const ReviewPage: React.FC<ReviewPageProps> = ({ 
  onNavigate, 
  profileData, 
  waiverData, 
  workoutFocusData,
  workoutType,
  workoutGeneration,
  onWorkoutGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Convert workout focus data to display format
  const displayWorkoutFocus = convertWorkoutFocusToDisplay(workoutFocusData, workoutType);

  const handleGenerateWorkout = useCallback(async () => {
    if (!profileData || !workoutFocusData || !validateWorkoutFocusData(workoutFocusData, workoutType)) {
      setGenerationError('Missing required data. Please complete your profile and workout focus.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Use the calculated workout intensity from TimeCommitmentStep, or calculate if not available
      const calculatedWorkoutIntensity = profileData.calculatedWorkoutIntensity || 
        (profileData.experienceLevel && profileData.intensityLevel ? 
          calculateWorkoutIntensity(
            mapExperienceLevelToFitnessLevel(profileData.experienceLevel),
            profileData.intensityLevel
          ) : 
          undefined
        );

      // Validate required profile data before building userProfile
      if (!profileData.experienceLevel) {
        throw new Error('Experience level is required but not provided in profile data');
      }
      
      if (!profileData.primaryGoal) {
        throw new Error('Primary goal is required but not provided in profile data');
      }

      // Use the calculated fitness level from ExperienceStep, or fall back to mapping if not available
      const fitnessLevel = profileData.calculatedFitnessLevel || mapExperienceLevelToFitnessLevel(profileData.experienceLevel);
      
      // Validate fitness level was determined correctly
      if (!fitnessLevel) {
        throw new Error(`Failed to determine fitness level. Experience level: "${profileData.experienceLevel}", Calculated fitness level: "${profileData.calculatedFitnessLevel}"`);
      }

      const userProfile: UserProfile = {
        fitnessLevel: fitnessLevel,
        goals: [profileData.primaryGoal.toLowerCase().replace(' ', '_')],
        preferences: {
          workoutStyle: profileData.preferredActivities.map(activity => 
            activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
          ),
          timePreference: 'morning',
          intensityPreference: calculatedWorkoutIntensity || 'moderate',
          advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: profileData.injuries.filter(injury => injury !== 'No Injuries'),
          availableEquipment: profileData.availableEquipment,
          availableLocations: profileData.availableLocations
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
      };

      const request: WorkoutGenerationRequest = {
        workoutType,
        profileData,
        waiverData: waiverData || undefined,
        workoutFocusData,
        userProfile
      };

      const generatedWorkout = await workoutGeneration.generateWorkout(request);
      
      if (generatedWorkout) {
        onWorkoutGenerated(generatedWorkout);
        onNavigate('results');
      } else {
        setGenerationError('Failed to generate workout. Please try again.');
      }
    } catch (error) {
      // Enhanced error logging with actionable information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages based on the error type
      if (errorMessage.includes('Experience level is required')) {
        setGenerationError('Please complete your experience level in your profile before generating a workout.');
      } else if (errorMessage.includes('Primary goal is required')) {
        setGenerationError('Please select a primary goal in your profile before generating a workout.');
      } else if (errorMessage.includes('userProfile is required')) {
        setGenerationError('Profile data is incomplete. Please complete your profile before generating a workout.');
      } else if (errorMessage.includes('fitnessLevel is required')) {
        setGenerationError('Fitness level could not be determined. Please update your experience level in your profile.');
      } else {
        setGenerationError(`An error occurred while generating your workout: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [profileData, waiverData, workoutFocusData, workoutType, workoutGeneration, onWorkoutGenerated, onNavigate]);

  // Add delay to ensure data is loaded before validation
  const [isDataReady, setIsDataReady] = React.useState(false);
  
  React.useEffect(() => {
    // Give a small delay to ensure App.tsx has loaded data from localStorage
    const timer = setTimeout(() => {
      setIsDataReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Comprehensive validation using the new validation service
  // But only run after data is ready to prevent race conditions
  const validationResult = React.useMemo(() => {
    if (!isDataReady) {
      return {
        isValid: false,
        issues: [],
        summary: { errors: 0, warnings: 0, info: 0 }
      };
    }
    
    return ValidationService.validateWorkoutData(
      workoutFocusData,
      profileData,
      workoutType,
      onNavigate
    );
  }, [workoutFocusData, profileData, workoutType, onNavigate, isDataReady]);
  
  // Legacy validation for backward compatibility
  const hasRequiredData = validationResult.isValid;
  
  // Detailed workout progression validation
  const detailedProgression = workoutType === 'detailed' 
    ? validateDetailedWorkoutProgression(workoutFocusData, profileData)
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-r ${
          workoutType === 'quick' 
            ? 'from-emerald-600 to-blue-600' 
            : 'from-purple-600 to-pink-600'
        } rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl`}>
          <Eye className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {workoutType === 'quick' ? 'Quick Workout Review' : 'Detailed Workout Review'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {workoutType === 'quick' 
            ? 'Confirm your quick workout preferences before generating your personalized routine'
            : 'Confirm your comprehensive workout configuration before generating your personalized routine'
          }
        </p>
        
        {/* Workout Type Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4 ${
          workoutType === 'quick'
            ? 'bg-gradient-to-r from-emerald-100 to-blue-100'
            : 'bg-gradient-to-r from-purple-100 to-pink-100'
        }`}>
          <Sparkles className={`w-4 h-4 ${
            workoutType === 'quick' ? 'text-emerald-600' : 'text-purple-600'
          }`} />
          <span className={`text-sm font-medium ${
            workoutType === 'quick' ? 'text-emerald-800' : 'text-purple-800'
          }`}>
            {workoutType === 'quick' ? 'Quick Workout Setup' : 'Detailed Workout Configuration'}
          </span>
        </div>
        
        {/* Validation Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4 ${
          validationResult.isValid
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {validationResult.isValid ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to Generate</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {validationResult.summary.errors} Issue{validationResult.summary.errors !== 1 ? 's' : ''} to Fix
              </span>
            </>
          )}
        </div>
      </div>

      {/* Validation Feedback */}
      {!validationResult.isValid && (
        <div className="max-w-4xl mx-auto">
          <ValidationFeedbackPanel
            issues={validationResult.issues}
            summary={validationResult.summary}
          />
        </div>
      )}

      {/* Generation Error */}
      {generationError && (
        <div className="max-w-4xl mx-auto mb-6">
          <ErrorHandlingPanel
            error={ErrorTemplates.generationFailed(generationError)}
            onRetry={handleGenerateWorkout}
            onDismiss={() => setGenerationError(null)}
          />
        </div>
      )}

      {/* Main Content - Only show if we have data */}
      {hasRequiredData && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Framework Section */}
            {profileData && (
              <ProfileSection profileData={profileData} />
            )}

            {/* Today's Workout Focus Section */}
            {displayWorkoutFocus && workoutFocusData && profileData && (
              workoutType === 'detailed' ? (
                <DetailedWorkoutSection 
                  profileData={profileData}
                  workoutFocusData={workoutFocusData}
                />
              ) : (
                <WorkoutSection 
                  profileData={profileData}
                  displayWorkoutFocus={displayWorkoutFocus}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-12 max-w-4xl mx-auto">
        <button 
          onClick={() => onNavigate('focus')}
          className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span>Back to Workout Focus</span>
        </button>
        
        <button 
          onClick={handleGenerateWorkout}
          disabled={!hasRequiredData || isGenerating || workoutGeneration.isGenerating}
          className={`flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r ${
            workoutType === 'quick' 
              ? 'from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700'
              : 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          } text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isGenerating || workoutGeneration.isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="text-lg">
                {workoutType === 'quick' ? 'Generating Quick Workout...' : 'Generating Detailed Workout...'}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg">
                {workoutType === 'quick' ? 'Generate Workout' : 'Generate Detailed Workout'}
              </span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>

      {/* Generation Progress */}
      {(isGenerating || workoutGeneration.isGenerating) && (
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generating Your Workout</h3>
              <span className="text-sm text-gray-600">
                {workoutGeneration.state.generationProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${workoutGeneration.state.generationProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Status: {workoutGeneration.status === 'generating' ? 'Creating your personalized workout...' :
                      workoutGeneration.status === 'enhancing' ? 'Adding finishing touches...' :
                      workoutGeneration.status === 'validating' ? 'Validating your information...' :
                      'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Edit Links */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button 
          onClick={() => onNavigate('profile')}
          className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
        >
          Edit Profile Information
        </button>
        <button 
          onClick={() => onNavigate('focus')}
          className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
        >
          Modify Workout Focus
        </button>
      </div>
    </div>
  );
}; 