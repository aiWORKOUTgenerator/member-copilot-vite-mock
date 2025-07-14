import React from 'react';
import { Zap, ChevronLeft, Download, Share2, RefreshCw, Clock, Target, TrendingUp } from 'lucide-react';

interface WorkoutResultsPageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

const WorkoutResultsPage: React.FC<WorkoutResultsPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your AI-Generated Workout</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A personalized workout routine created specifically for your goals and preferences
        </p>
      </div>

      {/* Workout Overview */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Duration", value: "45 min", icon: Clock, color: "text-blue-600" },
              { label: "Exercises", value: "8", icon: Target, color: "text-green-600" },
              { label: "Difficulty", value: "Intermediate", icon: TrendingUp, color: "text-purple-600" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50/50 rounded-xl">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Generated Workout Placeholder */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Workout Plan</h3>
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-center mb-4">
                AI-generated workout routine will be displayed here
              </p>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Exercise list, sets, reps, and rest periods</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Exercise instructions and form tips</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Progressive difficulty recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              onClick={() => onNavigate('review')}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Back to Review</span>
            </button>
            <button className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Generate New Workout</span>
            </button>
            <button className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Download className="w-4 h-4 mr-2" />
              <span>Download PDF</span>
            </button>
            <button className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Share2 className="w-4 h-4 mr-2" />
              <span>Share Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <h3 className="font-semibold text-gray-900 mb-4">Workout Analytics</h3>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-500 text-center">
              Progress tracking and analytics will be added here
            </p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <h3 className="font-semibold text-gray-900 mb-4">Workout History</h3>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-500 text-center">
              Previous workouts and performance history will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsPage;