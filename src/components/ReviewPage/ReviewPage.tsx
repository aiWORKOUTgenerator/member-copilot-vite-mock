import React, { useState, useCallback } from 'react';
import { Eye, ChevronLeft, ChevronRight, AlertTriangle, XCircle, Loader2, Sparkles, CheckCircle } from 'lucide-react';
// WorkoutType is imported via ReviewPageProps from ./types
import { WorkoutGenerationRequest } from '../../types/workout-generation.types';
import { UserProfile, TimePreference, IntensityLevel, AIAssistanceLevel } from '../../types/user';
import { mapExperienceLevelToFitnessLevel } from '../../utils/configUtils';
import { ReviewPageProps } from './types';
import { ProfileSection, WorkoutSection } from './sections';
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
      const userProfile: UserProfile = {
        fitnessLevel: mapExperienceLevelToFitnessLevel(profileData.experienceLevel),
        goals: [profileData.primaryGoal.toLowerCase().replace(' ', '_')],
        preferences: {
          workoutStyle: profileData.preferredActivities.map(activity => 
            activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
          ),
          timePreference: 'morning' as TimePreference,
          intensityPreference: profileData.intensityLevel as IntensityLevel,
          advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
          aiAssistanceLevel: 'moderate' as AIAssistanceLevel
        },
        basicLimitations: {
          injuries: profileData.injuries.filter(injury => injury !== 'No Injuries'),
          availableEquipment: profileData.availableEquipment,
          availableLocations: profileData.availableLocations
        },
        enhancedLimitations: {
          timeConstraints: 0, // This will be calculated by the AI service
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
      console.error('Workout generation failed:', error);
      setGenerationError('An error occurred while generating your workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profileData, waiverData, workoutFocusData, workoutType, workoutGeneration, onWorkoutGenerated, onNavigate]);

  // Comprehensive validation using the new validation service
  const validationResult = ValidationService.validateWorkoutData(
    workoutFocusData,
    profileData,
    workoutType,
    onNavigate
  );
  
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
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-2 ml-2 ${
          validationResult.isValid
            ? 'bg-green-100 text-green-800'
            : validationResult.summary.errors > 0
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {validationResult.isValid ? (
            <CheckCircle className="w-4 h-4" />
          ) : validationResult.summary.errors > 0 ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {validationResult.isValid 
              ? 'Ready to Generate' 
              : validationResult.summary.errors > 0 
              ? `${validationResult.summary.errors} Issue${validationResult.summary.errors !== 1 ? 's' : ''} to Fix`
              : `${validationResult.summary.warnings} Recommendation${validationResult.summary.warnings !== 1 ? 's' : ''}`
            }
          </span>
        </div>
      </div>

      {/* Comprehensive Validation Feedback */}
      {validationResult.issues.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <ValidationFeedbackPanel
            issues={validationResult.issues}
            title={
              validationResult.summary.errors > 0 
                ? 'Required Information Missing' 
                : validationResult.summary.warnings > 0 
                ? 'Recommendations for Better Results'
                : 'Additional Information Available'
            }
            showHelp={true}
            className="mb-4"
          />
        </div>
      )}

      {/* Detailed Workout Progression Indicator */}
      {workoutType === 'detailed' && detailedProgression && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className={`border rounded-lg p-4 ${
            detailedProgression.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  detailedProgression.isValid 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {detailedProgression.step}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Detailed Workout Setup Progress
                  </h3>
                  <p className="text-xs text-gray-600">
                    Step {detailedProgression.step} of {detailedProgression.totalSteps}: {detailedProgression.currentStep}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {Math.round((detailedProgression.step / detailedProgression.totalSteps) * 100)}% Complete
                </div>
                <div className="text-xs text-gray-600">
                  Next: {detailedProgression.nextStep}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  detailedProgression.isValid ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${(detailedProgression.step / detailedProgression.totalSteps) * 100}%` }}
              />
            </div>
            
            {/* Issues and Recommendations */}
            {detailedProgression.issues.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Issues to Address:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {detailedProgression.issues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {detailedProgression.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Recommendations:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {detailedProgression.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Error Handling */}
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
              <WorkoutSection 
                workoutFocusData={workoutFocusData}
                profileData={profileData}
                displayWorkoutFocus={displayWorkoutFocus}
              />
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
                {workoutType === 'quick' ? 'Generate Quick Workout' : 'Generate Detailed Workout'}
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