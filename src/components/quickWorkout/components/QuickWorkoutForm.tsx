import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../shared';
import { WorkoutFocusSection } from './WorkoutFocusSection';
import { WorkoutDurationSection } from './WorkoutDurationSection';
import { EnergyLevelSection } from './EnergyLevelSection';
import { useQuickWorkoutForm } from '../hooks/useQuickWorkoutForm';
import { QuickWorkoutFormProps } from '../types/quick-workout.types';

export const QuickWorkoutForm: React.FC<QuickWorkoutFormProps> = ({
  onNavigate,
  onBack
}) => {
  const {
    focusData,
    handleInputChange,
    isFormValid
  } = useQuickWorkoutForm();

  const handleSubmit = () => {
    if (isFormValid) {
      onNavigate('review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Quick Workout Setup"
        subtitle="Just a few quick questions to generate your personalized workout"
        icon={Sparkles}
        gradient="from-emerald-500 to-blue-600"
      />

      {/* Quick Form */}
      <div className="space-y-8">
        <WorkoutFocusSection
          focusData={focusData}
          onInputChange={handleInputChange}
        />
        
        <WorkoutDurationSection
          focusData={focusData}
          onInputChange={handleInputChange}
        />
        
        <EnergyLevelSection
          focusData={focusData}
          onInputChange={handleInputChange}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
          >
            Back to Options
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex-1 flex items-center justify-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group ${
              isFormValid
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
  );
}; 