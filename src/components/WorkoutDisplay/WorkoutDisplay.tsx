import React, { useState, useCallback } from 'react';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  Award, 
  Calendar, 
  Share2, 
  Download, 
  RefreshCw, 
  BookOpen,
  Heart,
  Lightbulb,
  CheckCircle
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
      {/* Workout Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{workout.title || 'Workout'}</h1>
            <p className="text-indigo-100 text-lg mb-4">{workout.description || 'Your personalized workout plan'}</p>
            
            {/* Workout Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(workout.difficulty || 'moderate')}`}>
              {workout.difficulty || 'Moderate'}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Award className="w-4 h-4" />
              <span>{Math.round((workout.confidence || 0.8) * 100)}% match</span>
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