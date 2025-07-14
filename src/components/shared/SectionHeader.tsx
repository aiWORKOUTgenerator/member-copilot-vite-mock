import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  gradient?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  icon: Icon, 
  gradient = "from-blue-500 to-purple-600" 
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 bg-gradient-to-r ${gradient} rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
  );
};

export default SectionHeader; 