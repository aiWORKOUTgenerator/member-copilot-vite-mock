import React from 'react';
import { Sparkles, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
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
    viewMode,
    handleInputChange,
    toggleViewMode,
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quick Workout Setup"
          subtitle="Just a few quick questions to generate your personalized workout"
          icon={Sparkles}
          gradient="from-emerald-500 to-blue-600"
        />
        
        {/* View Mode Toggle */}
        <button
          onClick={toggleViewMode}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {viewMode === 'complex' ? (
            <>
              <LayoutList className="w-4 h-4" />
              <span>Simple View</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span>Detailed View</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Form */}
      <div className="space-y-8">
        <WorkoutFocusSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
        />
        
        <WorkoutDurationSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
        />
        
        <EnergyLevelSection
          focusData={focusData}
          onInputChange={handleInputChange}
          viewMode={viewMode}
        />

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-300"
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