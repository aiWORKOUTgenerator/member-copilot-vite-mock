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
import DetailedWorkoutContainer from './DetailedWorkoutContainer';
import { PerWorkoutOptions } from '../types/enhanced-workout-types';

interface WorkoutFocusPageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

const WorkoutFocusPage: React.FC<WorkoutFocusPageProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'selection' | 'quick' | 'detailed'>('selection');
  const [focusData, setFocusData] = useState<WorkoutFocusData>(defaultWorkoutFocusData);
  const [currentSection, setCurrentSection] = useState(0);
  
  // Enhanced options state for detailed view - moved to top level to fix hook ordering
  const [enhancedOptions, setEnhancedOptions] = useState<PerWorkoutOptions>({});
  const [enhancedErrors, setEnhancedErrors] = useState<Record<string, string>>({});

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

  // Enhanced Detailed Workout Focus View with new architecture
  if (viewMode === 'detailed') {
    // Convert legacy data to enhanced format
    const convertToEnhancedOptions = (focusData: WorkoutFocusData): PerWorkoutOptions => {
      return {
        customization_duration: focusData.duration ? parseInt(focusData.duration.replace(' minutes', '')) : undefined,
        customization_focus: focusData.workoutFocus || undefined,
        customization_areas: focusData.focusAreas || undefined,
        customization_equipment: focusData.equipment || undefined,
        customization_energy: focusData.energyLevel ? ['Very Low', 'Low', 'Moderate', 'High', 'Very High'].indexOf(focusData.energyLevel) + 1 : undefined,
        customization_sleep: focusData.sleepQuality ? ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'].indexOf(focusData.sleepQuality) + 1 : undefined,
        customization_include: focusData.includeExercises?.join(', ') || undefined,
        customization_exclude: focusData.excludeExercises?.join(', ') || undefined,
      };
    };

    // Convert enhanced data back to legacy format
    const convertFromEnhancedOptions = (options: PerWorkoutOptions): Partial<WorkoutFocusData> => {
      const updates: Partial<WorkoutFocusData> = {};
      
      if (options.customization_duration) {
        const duration = typeof options.customization_duration === 'number' 
          ? options.customization_duration 
          : options.customization_duration.totalDuration;
        // Map to valid duration options
        const validDurations = ['30 minutes', '45 minutes', '60 minutes', '90+ minutes'] as const;
        const durationStr = duration >= 90 ? '90+ minutes' : 
                           duration >= 60 ? '60 minutes' : 
                           duration >= 45 ? '45 minutes' : '30 minutes';
        updates.duration = durationStr;
      }
      
      if (options.customization_focus) {
        const focus = typeof options.customization_focus === 'string' 
          ? options.customization_focus 
          : options.customization_focus.focus;
        // Map to valid focus options
        const validFocus = ['Weight Loss', 'Strength Building', 'Endurance', 'Muscle Gain', 'General Fitness'] as const;
        const focusMap: Record<string, typeof validFocus[number]> = {
          'weight_loss': 'Weight Loss',
          'strength': 'Strength Building',
          'endurance': 'Endurance',
          'muscle_gain': 'Muscle Gain',
          'general_fitness': 'General Fitness'
        };
        updates.workoutFocus = focusMap[focus] || 'General Fitness';
      }
      
      if (options.customization_areas) {
        if (Array.isArray(options.customization_areas)) {
          // Map to valid area options
          const validAreas = ['Cardio', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Flexibility'] as const;
          const areaMap: Record<string, typeof validAreas[number]> = {
            'cardio': 'Cardio',
            'full_body': 'Full Body',
            'upper_body': 'Upper Body',
            'lower_body': 'Lower Body',
            'core': 'Core',
            'flexibility': 'Flexibility'
          };
          updates.focusAreas = options.customization_areas
            .map(area => areaMap[area.toLowerCase().replace(' ', '_')] || area as typeof validAreas[number])
            .filter(Boolean);
        } else if (options.customization_areas) {
          const selected = Object.keys(options.customization_areas).filter(key => 
            options.customization_areas && 
            typeof options.customization_areas === 'object' && 
            !Array.isArray(options.customization_areas) && 
            options.customization_areas[key]?.selected
          );
          updates.focusAreas = selected as any; // Type assertion for compatibility
        }
      }
      
      if (options.customization_equipment) {
        if (Array.isArray(options.customization_equipment)) {
          // Map to valid equipment options
          const validEquipment = ['Full Gym', 'Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Bodyweight Only', 'Kettlebell'] as const;
          const equipmentMap: Record<string, typeof validEquipment[number]> = {
            'full_gym': 'Full Gym',
            'dumbbells': 'Dumbbells',
            'resistance_bands': 'Resistance Bands',
            'yoga_mat': 'Yoga Mat',
            'bodyweight': 'Bodyweight Only',
            'kettlebell': 'Kettlebell'
          };
          updates.equipment = options.customization_equipment
            .map(eq => equipmentMap[eq.toLowerCase().replace(' ', '_')] || eq as typeof validEquipment[number])
            .filter(Boolean);
        } else if (options.customization_equipment) {
          updates.equipment = options.customization_equipment.specificEquipment as any; // Type assertion for compatibility
        }
      }
      
      if (options.customization_energy) {
        const energyLabels = ['Low Energy', 'Moderate Energy', 'High Energy'] as const;
        const energyIndex = Math.min(Math.max(options.customization_energy - 1, 0), 2);
        updates.energyLevel = energyLabels[energyIndex];
      }
      
      if (options.customization_sleep) {
        const sleepLabels = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
        const sleepIndex = Math.min(Math.max(options.customization_sleep - 1, 0), 4);
        updates.sleepQuality = sleepLabels[sleepIndex];
      }
      
      return updates;
    };

    const handleEnhancedChange = (key: keyof PerWorkoutOptions, value: any) => {
      setEnhancedOptions(prev => ({ ...prev, [key]: value }));
      
      // Update legacy data
      const legacyUpdates = convertFromEnhancedOptions({ [key]: value });
      setFocusData(prev => ({ ...prev, ...legacyUpdates }));
    };

    return (
      <DetailedWorkoutContainer
        options={enhancedOptions}
        onChange={handleEnhancedChange}
        errors={enhancedErrors}
        disabled={false}
        onNavigate={onNavigate}
      />
    );
  }

  // This should not be reached, but adding as fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-lg font-medium mb-2">Loading...</div>
        <p className="text-sm">Please wait while we load your workout customization options.</p>
      </div>
    </div>
  );
};

export default WorkoutFocusPage;