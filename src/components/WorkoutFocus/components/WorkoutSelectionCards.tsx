import React from 'react';
import { Sparkles, ClipboardList, ChevronLeft, Stethoscope, Target, RotateCcw, Heart, Activity, Shield, TrendingDown, Dumbbell, Zap, Users, BarChart3, Calendar, Layers } from 'lucide-react';
import WorkoutCard from './WorkoutCard';

export interface WorkoutSelectionCardsProps {
  onQuickWorkoutSelect: () => void;
  onDetailedWorkoutSelect: () => void;
  onExRxSelect: () => void;
  onModalitySelect: () => void;
  onIntelligentVariationsSelect: () => void;
  onBackToProfile: () => void;
}

const WorkoutSelectionCards: React.FC<WorkoutSelectionCardsProps> = ({
  onQuickWorkoutSelect,
  onDetailedWorkoutSelect,
  onExRxSelect,
  onModalitySelect,
  onIntelligentVariationsSelect,
  onBackToProfile
}) => {
  const workoutCards = [
    {
      title: "Quick Workout Setup",
      description: "Get a personalized workout in minutes with our streamlined setup process.",
      icon: Sparkles,
      gradient: "from-emerald-500 to-blue-500",
      features: [
        "Fast and efficient setup",
        "AI-powered recommendations",
        "Basic customization options"
      ],
      badge: {
        text: "Beginner Friendly",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      },
      onClick: onQuickWorkoutSelect
    },
    {
      title: "Detailed Workout Focus",
      description: "Fine-tune every aspect of your workout with comprehensive customization options for the perfect routine.",
      icon: ClipboardList,
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Complete workout customization",
        "Equipment and exercise preferences",
        "Advanced targeting options"
      ],
      badge: {
        text: "Advanced",
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      onClick: onDetailedWorkoutSelect
    },
    {
      title: "ExRx - Exercise Prescription",
      description: "Medically-informed exercise prescriptions for injury recovery, chronic disease management, and reducing medication dependencies.",
      icon: Stethoscope,
      gradient: "from-blue-600 to-indigo-600",
      features: [
        "Cardiovascular disease management",
        "Injury rehabilitation protocols",
        "Medication dependency reduction",
        "Pain management through movement"
      ],
      badge: {
        text: "Medical Grade",
        color: "text-blue-700",
        bgColor: "bg-blue-100"
      },
      onClick: onExRxSelect
    },
    {
      title: "Workout Modalities",
      description: "Choose your workout by activity type - from strength training and yoga to HIIT and dance fitness. Pick what feels right today.",
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      features: [
        "Intuitive activity selection",
        "Match your current mood",
        "13 popular workout styles",
        "Beginner to advanced options"
      ],
      badge: {
        text: "Activity Based",
        color: "text-orange-700",
        bgColor: "bg-orange-100"
      },
      onClick: onModalitySelect
    },
    {
      title: "Intelligent Variations",
      description: "Upload your existing workout and generate intelligent variations for structured training plans, periodization, and progressive overload.",
      icon: RotateCcw,
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Progressive overload automation",
        "Periodization planning",
        "Block-based training cycles",
        "Smart workout variations"
      ],
      badge: {
        text: "AI-Powered",
        color: "text-purple-700",
        bgColor: "bg-purple-100"
      },
      onClick: onIntelligentVariationsSelect
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workoutCards.map((card, index) => (
          <WorkoutCard
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
            gradient={card.gradient}
            features={card.features}
            badge={card.badge}
            onClick={card.onClick}
          />
        ))}
      </div>

      {/* Back to Profile Button */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={onBackToProfile}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span>Back to Profile</span>
        </button>
      </div>
    </div>
  );
};

export default WorkoutSelectionCards; 