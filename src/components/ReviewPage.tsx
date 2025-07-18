import React, { useState, useCallback } from 'react';
import { Eye, ChevronLeft, ChevronRight, User, Target, Dumbbell, Clock, Activity, Heart, Zap, Battery, AlertTriangle, CheckCircle, XCircle, LucideIcon, Loader2, RefreshCw, Calendar, Settings, Home, Sparkles } from 'lucide-react';
import { ProfileData } from './Profile/types/profile.types';
import { LiabilityWaiverData } from './LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions, WorkoutType } from '../types/enhanced-workout-types';
import { UseWorkoutGenerationReturn } from '../hooks/useWorkoutGeneration';
import { WorkoutGenerationRequest } from '../types/workout-results.types';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { WORKOUT_FOCUS_MUSCLE_GROUPS } from '../types/workout-focus.types';
import { WORKOUT_EQUIPMENT_OPTIONS, filterAvailableEquipment } from '../utils/equipmentRecommendations';
import { UserProfile, TimePreference, IntensityLevel, AIAssistanceLevel } from '../types/user';
import { mapExperienceLevelToFitnessLevel } from '../utils/configUtils';

export interface ReviewPageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  profileData: ProfileData | null;
  waiverData: LiabilityWaiverData | null;
  workoutFocusData: PerWorkoutOptions | null;
  workoutType: WorkoutType;
  workoutGeneration: UseWorkoutGenerationReturn;
  onWorkoutGenerated: (workout: GeneratedWorkout) => void;
}

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
  const displayWorkoutFocus = workoutFocusData && {
    workoutFocus: String(workoutFocusData.customization_focus || 'Not specified'),
    workoutIntensity: String(profileData?.intensityLevel || 'Not specified'),
    workoutType: 'Balanced Training',
    duration: workoutFocusData.customization_duration ? 
      `${workoutFocusData.customization_duration} minutes` : 'Not specified',
    focusAreas: Array.isArray(workoutFocusData.customization_areas) ? 
      workoutFocusData.customization_areas : [],
    equipment: Array.isArray(workoutFocusData.customization_equipment) ? 
      workoutFocusData.customization_equipment : [],
    energyLevel: workoutFocusData.customization_energy ? 
      `${workoutFocusData.customization_energy}/10` : 'Not specified',
    currentSoreness: workoutFocusData.customization_soreness ? 
      Object.keys(workoutFocusData.customization_soreness)
        .filter(key => workoutFocusData.customization_soreness?.[key]?.selected)
        .map(key => ({
          area: key,
          level: workoutFocusData.customization_soreness?.[key]?.rating || 0
        })) : [],
    includeExercises: [],
    excludeExercises: []
  };

  // Ensure workout focus data is properly structured for validation
  const validateWorkoutFocusData = (data: PerWorkoutOptions | null): boolean => {
    if (!data) return false;
    return !!(
      data.customization_focus &&
      data.customization_duration &&
      data.customization_energy !== undefined &&
      Array.isArray(data.customization_areas) &&
      data.customization_areas.length > 0 &&
      Array.isArray(data.customization_equipment) &&
      data.customization_equipment.length > 0
    );
  };

  const handleGenerateWorkout = useCallback(async () => {
    if (!profileData || !workoutFocusData || !validateWorkoutFocusData(workoutFocusData)) {
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
        type: workoutType,
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

  // Check for missing required data
  const getMissingDataWarnings = () => {
    const warnings = [];
    
    if (!profileData) {
      warnings.push('Profile information is missing. Please complete your profile.');
    }
    
    if (!workoutFocusData) {
      warnings.push('Workout focus preferences are missing. Please set your workout preferences.');
    }
    
    return warnings;
  };

  const warnings = getMissingDataWarnings();
  const hasRequiredData = warnings.length === 0;

  // Only show data if it exists
  const ProfileSection = ({ title, icon: Icon, children, gradient }: { title: string; icon: LucideIcon; children: React.ReactNode; gradient: string }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mr-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  // DataRow component that handles React elements as values
  const DataRow = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value: string | string[] | React.ReactNode; 
    icon?: LucideIcon 
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-medium text-right">
        {Array.isArray(value) ? (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <span className="bg-gray-50 px-2 py-1 rounded">{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Eye className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Selections</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Confirm your profile and workout preferences before generating your personalized routine
        </p>
      </div>

      {/* Data Missing Warning */}
      {warnings.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Required Information Missing
                </h3>
                <div className="text-sm text-yellow-700 mt-1">
                  {warnings.map((warning, index) => (
                    <p key={index}>{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Error */}
      {generationError && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{generationError}</p>
                </div>
              </div>
              <button
                onClick={handleGenerateWorkout}
                className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show if we have data */}
      {hasRequiredData && (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Framework Section */}
            {profileData && (
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Fitness Profile</h2>
              <p className="text-gray-600">The foundation that shapes your workout framework</p>
            </div>

                {/* Experience & Activity */}
                <ProfileSection title="Experience & Activity" icon={Activity} gradient="from-blue-500 to-purple-500">
                  <div className="space-y-3">
                    <DataRow 
                      label="Experience Level" 
                      value={
                                profileData.experienceLevel
                      } 
                      icon={User} 
                    />
                    <DataRow 
                      label="Current Activity Level" 
                      value={
                        profileData.physicalActivity === 'sedentary' ? 'Sedentary' :
                        profileData.physicalActivity === 'light' ? 'Light Activity' :
                        profileData.physicalActivity === 'moderate' ? 'Moderately Active' :
                        profileData.physicalActivity === 'very' ? 'Very Active' :
                        profileData.physicalActivity === 'extremely' ? 'Extremely Active' :
                        'Varies'
                      } 
                      icon={Activity} 
                    />
                    <DataRow 
                      label="Activity Description" 
                      value={
                        profileData.physicalActivity === 'sedentary' ? 'Little to no physical activity beyond daily living' :
                        profileData.physicalActivity === 'light' ? 'Occasional light activities like walking' :
                        profileData.physicalActivity === 'moderate' ? 'Regular light to moderate activity 3-4 times per week' :
                        profileData.physicalActivity === 'very' ? 'Consistent daily activity including structured exercise' :
                        profileData.physicalActivity === 'extremely' ? 'Intense activity multiple times a day' :
                        profileData.physicalActivity === 'varies' ? 'Activity level changes weekly, from light to intense exercise' :
                        'Activity level changes weekly'
                      } 
                    />
                  </div>
                </ProfileSection>

                {/* Time & Intensity */}
                <ProfileSection title="Time & Intensity" icon={Clock} gradient="from-green-500 to-teal-500">
                  <div className="space-y-3">
                    <DataRow 
                      label="Preferred Duration" 
                      value={profileData.preferredDuration} 
                      icon={Clock}
                    />
                    <DataRow 
                      label="Weekly Commitment" 
                      value={`${profileData.timeCommitment} days per week`}
                      icon={Calendar} 
                    />
                    <DataRow 
                      label="Intensity Level" 
                      value={
                        profileData.intensityLevel === 'lightly' || profileData.intensityLevel === 'light-moderate' ? 
                          'Low Intensity - Comfortable pace, can easily hold a conversation' :
                        profileData.intensityLevel === 'moderately' || profileData.intensityLevel === 'active' ? 
                          'Moderate Intensity - Challenging but sustainable' :
                        profileData.intensityLevel === 'very' || profileData.intensityLevel === 'extremely' ? 
                          'High Intensity - Pushing limits, brief conversations only' :
                        'High Intensity - Pushing limits, brief conversations only'
                      }
                      icon={Zap} 
                    />
                    <DataRow 
                      label="Time Investment" 
                      value={(() => {
                        // Extract min duration from format like '30-45 min'
                        const [minDuration, maxDuration] = profileData.preferredDuration
                          .replace(' min', '')
                          .split('-')
                          .map(n => parseInt(n));
                        
                        // Extract weekly days from format like '3-4'
                        const [minDays, maxDays] = profileData.timeCommitment
                          .split('-')
                          .map(n => parseInt(n));

                        const minWeekly = minDuration * minDays;
                        const maxWeekly = maxDuration * maxDays;

                        // WHO target comparison
                        const WHO_TARGET = 150; // minutes per week
                        let targetStatus;
                        let statusColor;

                        if (maxWeekly < WHO_TARGET) {
                          targetStatus = 'Below WHO target';
                          statusColor = 'text-yellow-600 bg-yellow-50';
                        } else if (minWeekly >= WHO_TARGET) {
                          targetStatus = 'Exceeds WHO target';
                          statusColor = 'text-green-600 bg-green-50';
                        } else {
                          targetStatus = 'Meets WHO target';
                          statusColor = 'text-blue-600 bg-blue-50';
                        }

                        return (
                          <div className="space-y-1">
                            <div>{minWeekly} - {maxWeekly} minutes per week</div>
                            <div className={`text-sm px-2 py-1 rounded-full inline-block ${statusColor}`}>
                              {targetStatus} (150 min/week)
                            </div>
                          </div>
                        );
                      })()}
                      icon={Clock} 
                    />
                  </div>
                </ProfileSection>

                {/* Preferences & Resources */}
                <ProfileSection title="Preferences & Resources" icon={Settings} gradient="from-purple-500 to-pink-500">
                  <div className="space-y-3">
                    <DataRow 
                      label="Preferred Activities" 
                      value={profileData.preferredActivities.map(activity => (
                        <span key={activity} className="inline-block px-2 py-1 m-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                          {activity}
                        </span>
                      ))}
                      icon={Activity} 
                    />
                    <DataRow 
                      label="Available Training Locations" 
                      value={profileData.availableLocations.map(location => (
                        <span key={location} className="inline-block px-2 py-1 m-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {location}
                        </span>
                      ))}
                      icon={Home} 
                    />
                    <DataRow 
                      label="Available Equipment" 
                      value={profileData.availableEquipment.map(equipment => (
                        <span key={equipment} className="inline-block px-2 py-1 m-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                          {equipment}
                        </span>
                      ))}
                      icon={Dumbbell} 
                    />
                    <DataRow 
                      label="Workout Environment" 
                      value={(() => {
                        // Use the new availableLocations data directly
                        const environments = profileData.availableLocations.map(location => {
                          switch (location) {
                            case 'Gym': return 'Commercial Gym';
                            case 'Home Gym': return 'Home Gym Setup';
                            case 'Home': return 'Home Space';
                            case 'Parks/Outdoor Spaces': return 'Outdoor Areas';
                            case 'Swimming Pool': return 'Pool Access';
                            case 'Running Track': return 'Track Access';
                            default: return location;
                          }
                        });

                        return environments.length > 0 ? 
                          environments.join(' • ') : 
                          'Body Weight';
                      })()}
                      icon={Home} 
                    />
                    <DataRow 
                      label="Training Style" 
                      value={(() => {
                        const hasCardio = profileData.preferredActivities.some(act => 
                          ['Running/Jogging', 'Swimming', 'Cycling/Mountain Biking'].includes(act)
                        );
                        const hasStrength = profileData.availableEquipment.some(eq => 
                          ['Dumbbells', 'Resistance Bands', 'Kettlebells'].includes(eq)
                        );
                        const hasFlexibility = profileData.preferredActivities.some(act => 
                          ['Yoga', 'Pilates'].includes(act)
                        );

                        const styles = [];
                        if (hasCardio) styles.push('Cardio-focused');
                        if (hasStrength) styles.push('Strength Training');
                        if (hasFlexibility) styles.push('Flexibility Work');
                        if (styles.length === 0) styles.push('General Fitness');

                        return styles.join(' + ');
                      })()}
                      icon={Dumbbell} 
                    />
                  </div>
                </ProfileSection>

                {/* Goals & Timeline - Moved to separate section */}
                <ProfileSection title="Goals & Timeline" icon={Target} gradient="from-orange-500 to-red-500">
              <div className="space-y-3">
                    <DataRow label="Primary Goal" value={profileData.primaryGoal} icon={Target} />
                    <DataRow label="Timeline" value={profileData.goalTimeline} icon={Clock} />
                    <DataRow 
                      label="Goal Focus" 
                      value={
                        profileData.primaryGoal === 'Weight Loss' ? 'Sustainable weight loss through balanced training' :
                        profileData.primaryGoal === 'Strength' ? 'Build functional strength and power' :
                        profileData.primaryGoal === 'Cardio Health' ? 'Enhance cardiovascular endurance' :
                        profileData.primaryGoal === 'Flexibility & Mobility' ? 'Increase range of motion and mobility' :
                        profileData.primaryGoal === 'General Health' ? 'Maintain overall wellness' :
                        profileData.primaryGoal === 'Muscle Gain' ? 'Build lean muscle mass' :
                        'Customized training focus'
                      } 
                    />
              </div>
            </ProfileSection>

            {/* Physical Metrics */}
            <ProfileSection title="Physical Metrics" icon={User} gradient="from-green-500 to-teal-500">
              <div className="space-y-3">
                    <DataRow label="Age" value={`${profileData.age} years`} />
                    <DataRow label="Height" value={profileData.height} />
                    <DataRow label="Weight" value={`${profileData.weight} lbs`} />
                    <DataRow label="Gender" value={profileData.gender} />
              </div>
            </ProfileSection>

            {/* Health & Safety */}
            <ProfileSection title="Health & Safety" icon={Heart} gradient="from-red-500 to-pink-500">
              <div className="space-y-3">
                <DataRow 
                  label="Cardiovascular Conditions" 
                      value={profileData.hasCardiovascularConditions} 
                      icon={profileData.hasCardiovascularConditions === 'No' ? CheckCircle : AlertTriangle}
                />
                <DataRow 
                  label="Current Injuries" 
                      value={profileData.injuries} 
                      icon={profileData.injuries[0] === 'No Injuries' ? CheckCircle : AlertTriangle}
                />
              </div>
            </ProfileSection>
          </div>
            )}

          {/* Today's Workout Focus Section */}
            {displayWorkoutFocus && (
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Workout Focus</h2>
              <p className="text-gray-600">Your specific selections for this workout session</p>
            </div>

                {/* Quick Workout */}
                <ProfileSection title="Quick Workout" icon={Sparkles} gradient="from-purple-500 to-indigo-500">
              <div className="space-y-3">
                    <DataRow 
                      label="Primary Focus" 
                      value={String(displayWorkoutFocus?.workoutFocus)} 
                      icon={Target} 
                    />
                    <DataRow 
                      label="Duration" 
                      value={String(displayWorkoutFocus?.duration)} 
                      icon={Clock} 
                    />
                    <DataRow 
                      label="Energy Level" 
                      value={(() => {
                        const energyStr = String(displayWorkoutFocus?.energyLevel || '');
                        const level = parseInt(energyStr);
                        const description = level <= 3 ? 'Low - Consider a lighter workout' :
                                          level <= 6 ? 'Moderate - Good for standard workout' :
                                          'High - Ready for challenging workout';
                        return `${energyStr} (${description})`;
                      })()} 
                      icon={Battery} 
                    />
                    <DataRow 
                      label="Muscle Soreness" 
                      value={(() => {
                        if (!displayWorkoutFocus?.currentSoreness.length) {
                          return ['No reported soreness'];
                        }
                        return displayWorkoutFocus.currentSoreness.map(soreness => 
                          `${soreness.area} (Level ${soreness.level})`
                        );
                      })()} 
                      icon={AlertTriangle} 
                    />
              </div>
            </ProfileSection>

            {/* Training Details */}
            <ProfileSection title="Training Details" icon={Activity} gradient="from-teal-500 to-blue-500">
              <div className="space-y-3">
                    <DataRow 
                      label="Equipment Needed" 
                      value={(() => {
                        if (!displayWorkoutFocus?.workoutFocus || !profileData?.availableEquipment) {
                          return ['Body Weight'];
                        }

                        // Filter equipment based on what the user has available
                        return filterAvailableEquipment(
                          String(displayWorkoutFocus.workoutFocus),
                          profileData.availableEquipment,
                          profileData.availableLocations
                        );
                      })()} 
                      icon={Dumbbell} 
                    />
                    {/* Equipment Options */}
                    {displayWorkoutFocus?.workoutFocus && WORKOUT_EQUIPMENT_OPTIONS[displayWorkoutFocus.workoutFocus] && (
                      <div className="text-sm text-gray-600 italic pl-4 border-l-2 border-gray-200">
                        All possible equipment: {WORKOUT_EQUIPMENT_OPTIONS[displayWorkoutFocus.workoutFocus].equipment.join(', ')}
                      </div>
                    )}
                    {displayWorkoutFocus?.workoutFocus && WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus] && (
                      <>
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">Target Muscle Groups</h4>
                          {WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus].primaryMuscleGroups.map((group, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <div className="text-sm font-medium text-gray-700">{group.name}</div>
                              {group.description && (
                                <div className="text-sm text-gray-600 mt-1">{group.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">Training Emphasis</h4>
                          <div className="text-sm text-gray-600">
                            {WORKOUT_FOCUS_MUSCLE_GROUPS[displayWorkoutFocus.workoutFocus].emphasis}
                          </div>
                        </div>
                      </>
                    )}
              </div>
            </ProfileSection>

            {/* Workout Summary Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Quick Workout Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="opacity-80">Focus</div>
                      <div className="font-medium">{String(displayWorkoutFocus?.workoutFocus)}</div>
                </div>
                <div>
                  <div className="opacity-80">Duration</div>
                      <div className="font-medium">{String(displayWorkoutFocus?.duration)}</div>
                </div>
                <div>
                      <div className="opacity-80">Energy</div>
                      <div className="font-medium">{String(displayWorkoutFocus?.energyLevel)}</div>
                </div>
                <div>
                      <div className="opacity-80">Soreness</div>
                      <div className="font-medium">
                        {displayWorkoutFocus?.currentSoreness.length ? 
                          `${displayWorkoutFocus.currentSoreness.length} area(s)` : 
                          'None reported'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

export default ReviewPage;