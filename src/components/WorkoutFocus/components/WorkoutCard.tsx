import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

export interface WorkoutCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  features: string[];
  badge: {
    text: string;
    color: string;
    bgColor: string;
  };
  onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  features,
  badge,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer group"
    >
      <div className="relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <div className={`w-2 h-2 ${gradient.split(' ')[1]} rounded-full mr-3`}></div>
              {feature}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${badge.color} ${badge.bgColor} px-3 py-1 rounded-full`}>
            {badge.text}
          </span>
          <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:${gradient.split(' ')[1].replace('500', '500')} group-hover:translate-x-1 transition-all duration-300`} />
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard; 