import React, { useState } from 'react';
import { Target, ChevronLeft, ChevronRight, Dumbbell, Heart, Zap, Clock, Activity, AlertTriangle, Battery, Moon, Brain, Settings, Info, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from './shared';
import { 
  WorkoutFocusData, 
  workoutFocusSchema,
  quickWorkoutSchema,
  workoutSectionSchemas,
  defaultWorkoutFocusData,
  WORKOUT_FOCUS_OPTIONS,
  WORKOUT_INTENSITY_OPTIONS,
  WORKOUT_TYPE_OPTIONS,
  DURATION_OPTIONS,
  FOCUS_AREAS_OPTIONS,
  EQUIPMENT_OPTIONS,
  ENERGY_LEVEL_OPTIONS,
  SORENESS_OPTIONS,
  INCLUDE_EXERCISES_OPTIONS,
  EXCLUDE_EXERCISES_OPTIONS
} from '../schemas/workoutFocusSchema';
import { useFormValidation } from '../hooks/useFormValidation';

interface WorkoutFocusPageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

const WorkoutFocusPage: React.FC<WorkoutFocusPageProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'selection' | 'quick' | 'detailed'>('selection');
  const [focusData, setFocusData] = useState<WorkoutFocusData>(defaultWorkoutFocusData);
  const [currentSection, setCurrentSection] = useState(0);

  // Validation hooks
  const { validate: validateFull, validateField: validateFullField } = useFormValidation(workoutFocusSchema);
  const { validate: validateQuick, validateField: validateQuickField } = useFormValidation(quickWorkoutSchema);
  
  // Memoize validation to prevent re-renders
  const isQuickWorkoutValid = React.useMemo(() => {
    if (viewMode !== 'quick') return false;
    return validateQuick(focusData);
  }, [viewMode, focusData, validateQuick]);
  
  const isDetailedWorkoutValid = React.useMemo(() => {
    if (viewMode !== 'detailed') return false;
    // For detailed form, we need non-empty required fields and at least one equipment/focus area
    const hasRequiredFields = focusData.workoutFocus && focusData.workoutIntensity && 
                            focusData.workoutType && focusData.energyLevel && 
                            focusData.duration;
    const hasEquipment = focusData.equipment.length > 0;
    const hasFocusAreas = focusData.focusAreas.length > 0;
    
    return hasRequiredFields && hasEquipment && hasFocusAreas && validateFull(focusData);
  }, [viewMode, focusData, validateFull]);

  const handleInputChange = (field: keyof WorkoutFocusData, value: any) => {
    setFocusData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: 'focusAreas' | 'currentSoreness' | 'equipment' | 'includeExercises' | 'excludeExercises', value: any) => {
    setFocusData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).includes(value)
        ? (prev[field] as any[]).filter(item => item !== value)
        : [...(prev[field] as any[]), value]
    }));
  };

  const isFormValid = () => {
    return viewMode === 'quick' ? isQuickWorkoutValid : isDetailedWorkoutValid;
  };

  const handleQuickWorkout = () => {
    // Reset to default values first
    setFocusData(defaultWorkoutFocusData);
    // Then set quick workout specific defaults
    setFocusData(prev => ({
      ...prev,
      // Required fields for quick workout schema
      workoutFocus: '',  // User must choose this
      workoutIntensity: '', // User must choose this
      energyLevel: '', // User must choose this
      // Default values for other fields
      workoutType: 'Circuit Training',
      duration: '30 minutes',
      focusAreas: ['Full Body'],
      equipment: ['Bodyweight Only'],
      currentSoreness: ['No Soreness']
    }));
    setViewMode('quick');
  };

  const sections = [
    {
      title: "Workout Basics",
      description: "Define your primary workout focus and intensity",
      icon: Target,
      color: "from-green-500 to-blue-500"
    },
    {
      title: "Training Details",
      description: "Specify workout type, duration, and focus areas",
      icon: Settings,
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Equipment & Limitations",
      description: "Available equipment and current physical state",
      icon: Dumbbell,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Exercise Preferences",
      description: "Customize your exercise selection",
      icon: Info,
      color: "from-orange-500 to-red-500"
    }
  ];

  // Top Level Selection View
  if (viewMode === 'selection') {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Choose Your Workout Path"
          subtitle="Select how you'd like to create your workout routine"
          icon={Target}
          gradient="from-green-500 to-blue-600"
        />

        {/* Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Workout Card */}
            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                 onClick={handleQuickWorkout}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Workout</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get an instant AI-generated workout based on your profile. Perfect for when you want to jump straight into exercising.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Uses your existing profile data
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Minimal additional questions
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Ready in under 2 minutes
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Recommended
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Detailed Workout Focus Card */}
            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                 onClick={() => setViewMode('detailed')}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 text-white" />
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
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Workout Setup</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Just a few quick questions to generate your personalized workout
          </p>
        </div>

        {/* Quick Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="space-y-8">
              {/* Workout Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">What's your main goal for today's workout?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'Weight Loss' as const, icon: Activity, color: 'from-red-500 to-pink-500' },
                    { value: 'Strength Building' as const, icon: Dumbbell, color: 'from-blue-500 to-purple-500' },
                    { value: 'Endurance' as const, icon: Heart, color: 'from-green-500 to-teal-500' },
                    { value: 'General Fitness' as const, icon: Target, color: 'from-purple-500 to-indigo-500' }
                  ].filter(option => WORKOUT_FOCUS_OPTIONS.includes(option.value)).map(option => (
                    <label key={option.value} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      focusData.workoutFocus === option.value
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-blue-50/80 backdrop-blur-sm shadow-xl scale-105'
                        : 'border-white/30 bg-white/40 backdrop-blur-sm hover:border-emerald-300/50 hover:bg-white/60 hover:scale-[1.02]'
                    }`}>
                      <input
                        type="radio"
                        name="workoutFocus"
                        value={option.value}
                        checked={focusData.workoutFocus === option.value}
                        onChange={(e) => handleInputChange('workoutFocus', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center mr-3`}>
                          <option.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{option.value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workout Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">How intense do you want your workout?</label>
                <div className="space-y-2">
                  {WORKOUT_INTENSITY_OPTIONS.filter(intensity => intensity !== 'Maximum Intensity').map(intensity => (
                    <label key={intensity} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="workoutIntensity"
                        value={intensity}
                        checked={focusData.workoutIntensity === intensity}
                        onChange={(e) => handleInputChange('workoutIntensity', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.workoutIntensity === intensity
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-emerald-400'
                      }`}>
                        {focusData.workoutIntensity === intensity && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.workoutIntensity === intensity ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{intensity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Battery className="w-4 h-4 inline mr-2" />
                  How's your energy level right now?
                </label>
                <div className="space-y-2">
                  {ENERGY_LEVEL_OPTIONS.map(energy => (
                    <label key={energy} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="energyLevel"
                        value={energy}
                        checked={focusData.energyLevel === energy}
                        onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.energyLevel === energy
                          ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-yellow-400'
                      }`}>
                        {focusData.energyLevel === energy && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.energyLevel === energy ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{energy}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => setViewMode('selection')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
              >
                Back to Options
              </button>
              
              <button
                onClick={() => isFormValid() && onNavigate('review')}
                disabled={!isFormValid()}
                className={`flex-1 flex items-center justify-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Generate Quick Workout</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed Workout Focus View (existing implementation)
  const renderSection = () => {
    switch (currentSection) {
      case 0: // Workout Basics
        return (
          <div className="space-y-8">
            {/* Workout Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Primary Workout Focus</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { value: 'Weight Loss' as const, icon: Activity, color: 'from-red-500 to-pink-500' },
                  { value: 'Strength Building' as const, icon: Dumbbell, color: 'from-blue-500 to-purple-500' },
                  { value: 'Endurance' as const, icon: Heart, color: 'from-green-500 to-teal-500' },
                  { value: 'Muscle Gain' as const, icon: Zap, color: 'from-orange-500 to-red-500' },
                  { value: 'General Fitness' as const, icon: Target, color: 'from-purple-500 to-indigo-500' }
                ].filter(option => WORKOUT_FOCUS_OPTIONS.includes(option.value)).map(option => (
                  <label key={option.value} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    focusData.workoutFocus === option.value
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-xl scale-105'
                      : 'border-white/30 bg-white/40 backdrop-blur-sm hover:border-blue-300/50 hover:bg-white/60 hover:scale-[1.02]'
                  }`}>
                    <input
                      type="radio"
                      name="workoutFocus"
                      value={option.value}
                      checked={focusData.workoutFocus === option.value}
                      onChange={(e) => handleInputChange('workoutFocus', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center mb-3`}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{option.value}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Workout Intensity & Energy Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Workout Intensity</label>
                <div className="space-y-2">
                  {WORKOUT_INTENSITY_OPTIONS.map(intensity => (
                    <label key={intensity} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="workoutIntensity"
                        value={intensity}
                        checked={focusData.workoutIntensity === intensity}
                        onChange={(e) => handleInputChange('workoutIntensity', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.workoutIntensity === intensity
                          ? 'border-green-500 bg-gradient-to-r from-green-500 to-blue-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-green-400'
                      }`}>
                        {focusData.workoutIntensity === intensity && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.workoutIntensity === intensity ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{intensity}</span>
                      {focusData.workoutIntensity === intensity && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Battery className="w-4 h-4 inline mr-2" />
                  Current Energy Level
                </label>
                <div className="space-y-2">
                  {ENERGY_LEVEL_OPTIONS.map(energy => (
                    <label key={energy} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="energyLevel"
                        value={energy}
                        checked={focusData.energyLevel === energy}
                        onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.energyLevel === energy
                          ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-yellow-400'
                      }`}>
                        {focusData.energyLevel === energy && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.energyLevel === energy ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{energy}</span>
                      {focusData.energyLevel === energy && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Training Details
        return (
          <div className="space-y-8">
            {/* Workout Type & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Workout Type</label>
                <div className="space-y-2">
                  {WORKOUT_TYPE_OPTIONS.map(type => (
                    <label key={type} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="workoutType"
                        value={type}
                        checked={focusData.workoutType === type}
                        onChange={(e) => handleInputChange('workoutType', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.workoutType === type
                          ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-purple-400'
                      }`}>
                        {focusData.workoutType === type && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.workoutType === type ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{type}</span>
                      {focusData.workoutType === type && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Workout Duration
                </label>
                <div className="space-y-2">
                  {DURATION_OPTIONS.map(duration => (
                    <label key={duration} className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                      <input
                        type="radio"
                        name="duration"
                        value={duration}
                        checked={focusData.duration === duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                        focusData.duration === duration
                          ? 'border-teal-500 bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg'
                          : 'border-gray-300 bg-white/50 group-hover:border-teal-400'
                      }`}>
                        {focusData.duration === duration && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        focusData.duration === duration ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{duration}</span>
                      {focusData.duration === duration && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Focus Areas (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {FOCUS_AREAS_OPTIONS.map(area => (
                  <label key={area} className="group relative flex items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                    <input
                      type="checkbox"
                      checked={focusData.focusAreas.includes(area)}
                      onChange={() => handleCheckboxChange('focusAreas', area)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 ${
                      focusData.focusAreas.includes(area)
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 shadow-md'
                        : 'border-gray-300 bg-white/50 group-hover:border-blue-400'
                    }`}>
                      {focusData.focusAreas.includes(area) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      focusData.focusAreas.includes(area) ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>{area}</span>
                    {focusData.focusAreas.includes(area) && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Sleep Quality & Stress Level (Read-only defaults) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Moon className="w-4 h-4 inline mr-2" />
                  Sleep Quality
                </label>
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <span className="font-medium text-gray-700">{focusData.sleepQuality}</span>
                  <p className="text-sm text-gray-500 mt-1">Based on your profile information</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Brain className="w-4 h-4 inline mr-2" />
                  Stress Level
                </label>
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <span className="font-medium text-gray-700">{focusData.stressLevel}</span>
                  <p className="text-sm text-gray-500 mt-1">Based on your profile information</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Equipment & Limitations
        return (
          <div className="space-y-8">
            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Equipment (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EQUIPMENT_OPTIONS.map(equipment => (
                  <label key={equipment} className="group relative flex items-center p-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                    <input
                      type="checkbox"
                      checked={focusData.equipment.includes(equipment)}
                      onChange={() => handleCheckboxChange('equipment', equipment)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 ${
                      focusData.equipment.includes(equipment)
                        ? 'border-green-500 bg-gradient-to-r from-green-500 to-teal-500 shadow-md'
                        : 'border-gray-300 bg-white/50 group-hover:border-green-400'
                    }`}>
                      {focusData.equipment.includes(equipment) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      focusData.equipment.includes(equipment) ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>{equipment}</span>
                    {focusData.equipment.includes(equipment) && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-teal-500/5 pointer-events-none"></div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Current Soreness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Current Soreness/Areas to Avoid (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SORENESS_OPTIONS.map(soreness => (
                  <label key={soreness} className="group relative flex items-center p-3 bg-yellow-50/60 backdrop-blur-sm border border-yellow-200/50 rounded-xl hover:bg-yellow-100/60 hover:border-yellow-300/50 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                    <input
                      type="checkbox"
                      checked={focusData.currentSoreness.includes(soreness)}
                      onChange={() => handleCheckboxChange('currentSoreness', soreness)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 ${
                      focusData.currentSoreness.includes(soreness)
                        ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-md'
                        : 'border-yellow-300 bg-yellow-50/50 group-hover:border-yellow-400'
                    }`}>
                      {focusData.currentSoreness.includes(soreness) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      focusData.currentSoreness.includes(soreness) ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>{soreness}</span>
                    {focusData.currentSoreness.includes(soreness) && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none"></div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Exercise Preferences
        return (
          <div className="space-y-8">
            {/* Include/Exclude Exercises */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Exercises (Optional)</label>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {INCLUDE_EXERCISES_OPTIONS.map(exercise => (
                    <label key={exercise} className="group relative flex items-center p-2 bg-green-50/60 backdrop-blur-sm border border-green-200/50 rounded-xl hover:bg-green-100/60 hover:border-green-300/50 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                      <input
                        type="checkbox"
                        checked={focusData.includeExercises.includes(exercise)}
                        onChange={() => handleCheckboxChange('includeExercises', exercise)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 ${
                        focusData.includeExercises.includes(exercise)
                          ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 shadow-md'
                          : 'border-green-300 bg-green-50/50 group-hover:border-green-400'
                      }`}>
                        {focusData.includeExercises.includes(exercise) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        focusData.includeExercises.includes(exercise) ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{exercise}</span>
                      {focusData.includeExercises.includes(exercise) && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Exercises to Avoid (Optional)</label>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {EXCLUDE_EXERCISES_OPTIONS.map(exercise => (
                    <label key={exercise} className="group relative flex items-center p-2 bg-red-50/60 backdrop-blur-sm border border-red-200/50 rounded-xl hover:bg-red-100/60 hover:border-red-300/50 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                      <input
                        type="checkbox"
                        checked={focusData.excludeExercises.includes(exercise)}
                        onChange={() => handleCheckboxChange('excludeExercises', exercise)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all duration-300 ${
                        focusData.excludeExercises.includes(exercise)
                          ? 'border-red-500 bg-gradient-to-r from-red-500 to-rose-500 shadow-md'
                          : 'border-red-300 bg-red-50/50 group-hover:border-red-400'
                      }`}>
                        {focusData.excludeExercises.includes(exercise) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        focusData.excludeExercises.includes(exercise) ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{exercise}</span>
                      {focusData.excludeExercises.includes(exercise) && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 pointer-events-none"></div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Workout Focus</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Fine-tune your workout preferences for the perfect AI-generated routine
        </p>
      </div>

      {/* Section Navigation */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                currentSection === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Section Header */}
          <div className="flex items-center mb-8">
            <div className={`w-12 h-12 bg-gradient-to-r ${sections[currentSection].color} rounded-lg flex items-center justify-center mr-4`}>
              {(() => {
                const IconComponent = sections[currentSection].icon;
                return <IconComponent className="w-6 h-6 text-white" />;
              })()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{sections[currentSection].title}</h2>
              <p className="text-gray-600">{sections[currentSection].description}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="mb-8">
            {renderSection()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-4">
              {currentSection > 0 && (
                <button
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                >
                  Previous
                </button>
              )}
              {currentSection < sections.length - 1 && (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Next
                </button>
              )}
            </div>
            
            {currentSection === sections.length - 1 && (
              <button
                onClick={() => isFormValid() && onNavigate('review')}
                disabled={!isFormValid()}
                className={`flex-1 flex items-center justify-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Review Selections</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>

          {/* Back to Selection Button */}
          {currentSection === 0 && (
            <div className="mt-4">
              <button 
                onClick={() => setViewMode('selection')}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Back to Options</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
          {!isFormValid() && currentSection === sections.length - 1 && (
            <p className="text-sm text-orange-600 mt-2">
              Please complete all required fields: Workout Focus, Intensity, Type, Focus Areas, Equipment, Energy Level, and Duration
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutFocusPage;