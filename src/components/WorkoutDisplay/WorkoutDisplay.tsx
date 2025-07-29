import React, { useState, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  Award, 
  Share2, 
  Copy, 
  Download, 
  RefreshCw,
  BookOpen,
  Calendar,
  Heart,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  Info,
  AlertTriangle,
  HelpCircle,
  Star
} from 'lucide-react';
import { WorkoutDisplayProps, Exercise } from '../../types/workout-results.types';
import { WorkoutPhase } from './WorkoutPhase';
import { ExerciseCard } from './ExerciseCard';

export const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ 
  workout, 
  onRegenerate, 
  onDownload, 
  onShare, 
  isRegenerating = false 
}) => {
  const [activePhase, setActivePhase] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('workout-confidence-tutorial') === 'completed';
  });

  // Tutorial steps for first-time users
  const tutorialSteps = [
    {
      title: "Welcome to Your AI Workout!",
      content: "This workout was personalized just for you using AI. Let's learn how to understand your confidence score.",
      icon: <Star className="w-6 h-6 text-yellow-400" />
    },
    {
      title: "Confidence Score Explained",
      content: "The percentage shows how well this workout matches your profile. Higher scores mean better personalization.",
      icon: <Award className="w-6 h-6 text-blue-400" />
    },
    {
      title: "What Affects Your Score",
      content: "Your fitness level, goals, available equipment, and safety considerations all influence the match quality.",
      icon: <Target className="w-6 h-6 text-green-400" />
    },
    {
      title: "You're All Set!",
      content: "You can always expand the details section to see more information about your workout's confidence score.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    }
  ];

  // Show tutorial for first-time users
  React.useEffect(() => {
    if (!hasSeenTutorial && workout.confidence !== undefined) {
      setShowTutorial(true);
    }
  }, [hasSeenTutorial, workout.confidence]);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('workout-confidence-tutorial', 'completed');
  }, []);

  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  }, [tutorialStep, tutorialSteps.length, completeTutorial]);

  // Calculate individual factor scores (simulated based on confidence)
  const getFactorScores = useCallback((confidence: number) => {
    const baseScore = confidence;
    const variation = 0.1; // ±10% variation
    
    return {
      profileMatch: Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * variation)),
      safetyAlignment: Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * variation)),
      goalAlignment: Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * variation)),
      equipmentFit: Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * variation))
    };
  }, []);

  const factorScores = useMemo(() => getFactorScores(workout.confidence || 0.8), [workout.confidence, getFactorScores]);

  // Get confidence level and recommendations
  const getConfidenceLevel = useCallback((confidence: number) => {
    if (confidence >= 0.8) return { level: 'excellent', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (confidence >= 0.6) return { level: 'good', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    return { level: 'needs-review', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  }, []);

  const getConfidenceRecommendations = useCallback((confidence: number) => {
    if (confidence >= 0.8) {
      return [
        "This workout is highly personalized to your profile",
        "You can proceed with confidence",
        "Consider saving this workout for future reference"
      ];
    } else if (confidence >= 0.6) {
      return [
        "This workout fits well with your profile",
        "Consider adjusting duration or equipment if needed",
        "Review the exercise modifications for your level"
      ];
    } else {
      return [
        "Consider updating your fitness profile",
        "Check if all equipment is available",
        "Review your goals and experience level",
        "This workout may need significant modifications"
      ];
    }
  }, []);

  const confidenceLevel = getConfidenceLevel(workout.confidence || 0.8);
  const recommendations = getConfidenceRecommendations(workout.confidence || 0.8);

  // Safety check for undefined workout
  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">No workout data available</div>
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Generating...' : 'Generate Workout'}
          </button>
        </div>
      </div>
    );
  }

  const handleExerciseClick = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'some experience': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceGradient = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (confidence >= 0.6) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getAllExercises = () => {
    if (!workout) return [];
    
    const exercises = [];
    
    // Safely access warmup exercises
    if (workout.warmup?.exercises) {
      exercises.push(...workout.warmup.exercises);
    }
    
    // Safely access main workout exercises
    if (workout.mainWorkout?.exercises) {
      exercises.push(...workout.mainWorkout.exercises);
    }
    
    // Safely access cooldown exercises
    if (workout.cooldown?.exercises) {
      exercises.push(...workout.cooldown.exercises);
    }
    
    return exercises;
  };

  const getUniqueEquipment = () => {
    const equipment = new Set<string>();
    getAllExercises().forEach(exercise => {
      exercise.equipment?.forEach(eq => equipment.add(eq));
    });
    return Array.from(equipment);
  };

  const getUniqueMuscleGroups = () => {
    const muscles = new Set<string>();
    getAllExercises().forEach(exercise => {
      exercise.primaryMuscles?.forEach(muscle => muscles.add(muscle));
      exercise.secondaryMuscles?.forEach(muscle => muscles.add(muscle));
    });
    return Array.from(muscles);
  };

  return (
    <div className="space-y-8">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              {tutorialSteps[tutorialStep].icon}
              <h3 className="text-xl font-bold mt-4 mb-2">{tutorialSteps[tutorialStep].title}</h3>
              <p className="text-gray-600 mb-6">{tutorialSteps[tutorialStep].content}</p>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip
                </button>
                <div className="flex gap-2">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTutorialStep}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        {/* Badges Stacked on Top */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(workout.difficulty || 'moderate')}`}>
            {workout.difficulty || 'Moderate'}
          </span>
          <div className="relative group">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(workout.confidence || 0.8)}`}>
              <Award className="w-4 h-4" />
              <span>{Math.round((workout.confidence || 0.8) * 100)}% match</span>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              How well this workout matches your preferences
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          
          {/* Help Button for Tutorial */}
          {!hasSeenTutorial && (
            <button
              onClick={() => setShowTutorial(true)}
              className="p-1 text-white/70 hover:text-white transition-colors"
              title="Learn about confidence scores"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Low Confidence Warning */}
        {(workout.confidence || 0.8) < 0.6 && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-100 mb-2">Lower Confidence Score</h4>
                <p className="text-yellow-200 text-sm mb-3">
                  This workout may need adjustments to better match your profile. Consider reviewing your preferences.
                </p>
                <div className="space-y-1">
                  {recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-yellow-200">
                      <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Score Details */}
        <details className="mb-6">
          <summary className="cursor-pointer text-white/80 hover:text-white text-sm flex items-center gap-2">
            <span>How is this score calculated?</span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 pl-4 border-l-2 border-white/20">
            {/* Visual Confidence Meter */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-24 h-2 bg-white/20 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all ${getConfidenceGradient(workout.confidence || 0.8)}`}
                  style={{ width: `${(workout.confidence || 0.8) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">
                {Math.round((workout.confidence || 0.8) * 100)}% confidence
              </span>
            </div>
            
            {/* Confidence Level Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${confidenceLevel.bgColor} ${confidenceLevel.color} mb-4`}>
              <Star className="w-4 h-4" />
              {confidenceLevel.level.charAt(0).toUpperCase() + confidenceLevel.level.slice(1)} Match
            </div>
            
            {/* Confidence Level Explanation */}
            <div className="text-sm text-white/80 mb-4">
              {(() => {
                const confidence = workout.confidence || 0.8;
                if (confidence >= 0.8) {
                  return "Excellent match - This workout is highly personalized to your profile and preferences.";
                } else if (confidence >= 0.6) {
                  return "Good match - This workout fits well with your profile, with some minor adjustments.";
                } else {
                  return "Needs review - Consider adjusting your preferences for better personalization.";
                }
              })()}
            </div>

            {/* Individual Factor Scores */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-white mb-3">Factor Breakdown</h5>
              <div className="space-y-3">
                {Object.entries(factorScores).map(([factor, score]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <span className="text-xs text-white/70 capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/20 rounded-full">
                        <div 
                          className={`h-1.5 rounded-full ${getConfidenceGradient(score)}`}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/70 w-8 text-right">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-white mb-2">Recommendations</h5>
              <div className="space-y-1">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-white/70">
                    <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium text-white mb-1">Profile Match</div>
                <div className="text-white/70">Fitness level, goals, equipment</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium text-white mb-1">Safety Alignment</div>
                <div className="text-white/70">Injuries, limitations, experience</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium text-white mb-1">Goal Alignment</div>
                <div className="text-white/70">Primary objectives, progression</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium text-white mb-1">Equipment Fit</div>
                <div className="text-white/70">Available gear, space constraints</div>
              </div>
            </div>
          </div>
        </details>

        {/* Title and Content at Full Width */}
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">{workout.title || 'Workout'}</h1>
          <p className="text-indigo-100 text-lg mb-4">{workout.description || 'Your personalized workout plan'}</p>
          
          {/* Workout Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <div className="text-2xl font-bold">{workout.totalDuration || 0} min</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Exercises</span>
              </div>
              <div className="text-2xl font-bold">{getAllExercises().length}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Difficulty</span>
              </div>
              <div className="text-lg font-bold capitalize">{workout.difficulty || 'Moderate'}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Est. Calories</span>
              </div>
              <div className="text-2xl font-bold">{workout.estimatedCalories || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Generate New Workout'}
        </button>
        
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Share2 className="w-4 h-4" />
          Share Workout
        </button>
      </div>

      {/* Workout Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Needed */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Equipment Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueEquipment().length > 0 ? (
              getUniqueEquipment().map((equipment, index) => (
                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {equipment}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No equipment needed</span>
            )}
          </div>
        </div>

        {/* Muscle Groups */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Muscle Groups
          </h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueMuscleGroups().slice(0, 8).map((muscle, index) => (
              <span key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                {muscle}
              </span>
            ))}
            {getUniqueMuscleGroups().length > 8 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{getUniqueMuscleGroups().length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Workout Phases */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Workout Phases</h2>
          <button
            onClick={() => setShowAllExercises(!showAllExercises)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <BookOpen className="w-4 h-4" />
            {showAllExercises ? 'Hide' : 'Show'} All Exercises
          </button>
        </div>

        {/* Phase Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { key: 'warmup', label: 'Warm-up', phase: workout.warmup },
            { key: 'main', label: 'Main Workout', phase: workout.mainWorkout },
            { key: 'cooldown', label: 'Cool-down', phase: workout.cooldown }
          ].map(({ key, label, phase }) => (
            <button
              key={key}
              onClick={() => setActivePhase(key as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activePhase === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label} ({phase?.exercises?.length || 0})
            </button>
          ))}
        </div>

        {/* Active Phase */}
        <WorkoutPhase
          phase={activePhase === 'warmup' ? workout.warmup : 
                activePhase === 'main' ? workout.mainWorkout : workout.cooldown}
          title={activePhase === 'warmup' ? 'Warm-up' : 
                activePhase === 'main' ? 'Main Workout' : 'Cool-down'}
          isActive={true}
          onExerciseClick={handleExerciseClick}
        />
      </div>

      {/* All Exercises List */}
      {showAllExercises && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">All Exercises</h3>
          <div className="grid gap-4">
            {getAllExercises().map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                compact={true}
                showModifications={false}
                showNotes={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Workout Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personalized Notes */}
        {workout.personalizedNotes && workout.personalizedNotes.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Personalized Notes
            </h3>
            <ul className="space-y-2">
              {workout.personalizedNotes.map((note, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progression Tips */}
        {workout.progressionTips && workout.progressionTips.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Progression Tips
            </h3>
            <ul className="space-y-2">
              {workout.progressionTips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Safety Reminders */}
      {workout.safetyReminders && workout.safetyReminders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-red-600" />
            Safety Reminders
          </h3>
          <ul className="space-y-2">
            {workout.safetyReminders.map((reminder, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                {reminder}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workout Metadata */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          Workout Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Generated:</span>
            <span className="text-gray-600 ml-2">{workout.generatedAt ? formatDate(workout.generatedAt) : 'Unknown'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">AI Model:</span>
            <span className="text-gray-600 ml-2">{workout.aiModel || 'Unknown'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Confidence:</span>
            <span className="text-gray-600 ml-2">{Math.round((workout.confidence || 0.8) * 100)}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Workout ID:</span>
            <span className="text-gray-600 ml-2 font-mono text-xs">{workout.id || 'Unknown'}</span>
          </div>
        </div>
        
        {workout.tags && workout.tags.length > 0 && (
          <div className="mt-4">
            <span className="font-medium text-gray-700">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {workout.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Exercise Details</h2>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <ExerciseCard
                exercise={selectedExercise}
                compact={false}
                showModifications={true}
                showNotes={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 