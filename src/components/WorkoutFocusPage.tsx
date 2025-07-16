import React, { useState } from 'react';
import { PenLine, ChevronLeft, ClipboardList, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from './shared';
import { QuickWorkoutForm } from './quickWorkout/components';
import DetailedWorkoutContainer from './DetailedWorkoutContainer';
import { PerWorkoutOptions } from '../types/enhanced-workout-types';

interface WorkoutFocusPageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

type ViewMode = 'selection' | 'quick' | 'detailed';

const WorkoutFocusPage: React.FC<WorkoutFocusPageProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [options, setOptions] = useState<PerWorkoutOptions>({});

  const handleOptionsChange = (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Selection View
  if (viewMode === 'selection') {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Choose Your Workout Path"
          subtitle="Select how you'd like to create your workout routine"
          icon={PenLine}
          gradient="from-green-500 to-blue-600"
        />

        {/* Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Workout Card */}
            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                 onClick={() => setViewMode('quick')}>
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
                  <ClipboardList className="w-8 h-8 text-white" />
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
      <QuickWorkoutForm
        onNavigate={onNavigate}
        onBack={() => setViewMode('selection')}
      />
    );
  }

  // Detailed Workout View
  return (
    <DetailedWorkoutContainer
      options={options}
      onChange={handleOptionsChange}
      errors={{}}
      disabled={false}
      onNavigate={onNavigate}
    />
  );
};

export default WorkoutFocusPage;