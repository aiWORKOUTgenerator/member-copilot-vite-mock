import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Repeat, Target, AlertTriangle, Info, User, Play } from 'lucide-react';
import { Exercise, ExerciseDisplayProps } from '../../types/workout-results.types';

export const ExerciseCard: React.FC<ExerciseDisplayProps> = ({ 
  exercise, 
  showModifications = true, 
  showNotes = true, 
  compact = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'form' | 'modifications' | 'demo'>('details');

  const getDurationDisplay = () => {
    if (exercise.duration) {
      const minutes = Math.floor(exercise.duration / 60);
      const seconds = exercise.duration % 60;
      // ✅ FIXED: Always show minutes if duration is 60+ seconds, otherwise show seconds
      if (exercise.duration >= 60) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
      }
      return `${seconds}s`;
    }
    return null;
  };

  const getSetsRepsDisplay = () => {
    if (exercise.sets && exercise.reps) {
      return `${exercise.sets} sets × ${exercise.reps} reps`;
    }
    if (exercise.sets) {
      return `${exercise.sets} sets`;
    }
    if (exercise.reps) {
      return `${exercise.reps} reps`;
    }
    return null;
  };

  const getRestTimeDisplay = () => {
    if (exercise.restTime) {
      const minutes = Math.floor(exercise.restTime / 60);
      const seconds = exercise.restTime % 60;
      // ✅ FIXED: Always show minutes if rest time is 60+ seconds, otherwise show seconds
      if (exercise.restTime >= 60) {
        return seconds > 0 ? `${minutes}m ${seconds}s rest` : `${minutes}m rest`;
      }
      return `${seconds}s rest`;
    }
    return null;
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-red-100 text-red-800';
      case 'cardio': return 'bg-blue-100 text-blue-800';
      case 'flexibility': return 'bg-green-100 text-green-800';
      case 'balance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCompactView = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{exercise.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{exercise.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {getDurationDisplay() && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getDurationDisplay()}</span>
              </div>
            )}
            {getSetsRepsDisplay() && (
              <div className="flex items-center gap-1">
                <Repeat className="w-4 h-4" />
                <span>{getSetsRepsDisplay()}</span>
              </div>
            )}
            {exercise.movementType && (
              <span className={`px-2 py-1 rounded-full text-xs ${getMovementTypeColor(exercise.movementType)}`}>
                {exercise.movementType}
              </span>
            )}
          </div>
        </div>
        
        {!compact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );

  const renderFullView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{exercise.name}</h3>
            <p className="text-gray-600 mb-4">{exercise.description}</p>
            
            {/* Exercise Stats */}
            <div className="flex items-center gap-6 text-sm">
              {getDurationDisplay() && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{getDurationDisplay()}</span>
                </div>
              )}
              {getSetsRepsDisplay() && (
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{getSetsRepsDisplay()}</span>
                </div>
              )}
              {getRestTimeDisplay() && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{getRestTimeDisplay()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {exercise.movementType && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMovementTypeColor(exercise.movementType)}`}>
                {exercise.movementType}
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Equipment and Muscles */}
        <div className="mt-4 flex items-center gap-6">
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Equipment: </span>
              <span className="text-sm text-gray-600">{exercise.equipment.join(', ')}</span>
            </div>
          )}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Primary: </span>
              <span className="text-sm text-gray-600">{exercise.primaryMuscles.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'details', label: 'Details', icon: Info },
              { id: 'form', label: 'Form & Safety', icon: Target },
              ...(showModifications && exercise.modifications && exercise.modifications.length > 0 ? 
                [{ id: 'modifications', label: 'Modifications', icon: User }] : []),
              { id: 'demo', label: 'Demo', icon: Play }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondaryMuscles.map((muscle, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showNotes && exercise.personalizedNotes && exercise.personalizedNotes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personalized Notes</h4>
                    <ul className="space-y-1">
                      {exercise.personalizedNotes.map((note, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exercise.difficultyAdjustments && exercise.difficultyAdjustments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Difficulty Adjustments</h4>
                    <div className="space-y-2">
                      {exercise.difficultyAdjustments.map((adjustment, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              adjustment.level === 'new to exercise' ? 'bg-green-100 text-green-800' :
                              adjustment.level === 'some experience' ? 'bg-yellow-100 text-yellow-800' :
                              adjustment.level === 'advanced athlete' ? 'bg-red-100 text-red-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {adjustment.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{adjustment.modification}</p>
                          <p className="text-xs text-gray-500">{adjustment.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'form' && (
              <div className="space-y-4">
                {exercise.form && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Form Cues</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{exercise.form}</p>
                  </div>
                )}

                {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Common Mistakes to Avoid
                    </h4>
                    <ul className="space-y-2">
                      {exercise.commonMistakes.map((mistake, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'modifications' && exercise.modifications && (
              <div className="space-y-4">
                {exercise.modifications.map((modification, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        modification.type === 'easier' ? 'bg-green-100 text-green-800' :
                        modification.type === 'harder' ? 'bg-red-100 text-red-800' :
                        modification.type === 'injury' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {modification.type}
                      </span>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">{modification.description}</h5>
                    <p className="text-sm text-gray-600">{modification.instructions}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="space-y-4">
                <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Exercise Demo</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Visual demonstration of proper form and technique
                  </p>
                  <div className="space-y-3">
                    {/* Placeholder for demo content */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Demo Image/GIF</span>
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      </div>
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Demo content will appear here</span>
                      </div>
                    </div>
                    
                    {/* Additional demo content can be added here */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Step-by-Step Guide</span>
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded"></div>
                        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return compact ? renderCompactView() : renderFullView();
}; 