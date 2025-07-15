import React from 'react';
import { Shield } from 'lucide-react';

interface WaiverHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const WaiverHeader: React.FC<WaiverHeaderProps> = ({ 
  title = "Liability Waiver",
  description,
  icon: Icon = Shield
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-600 text-sm ml-12">{description}</p>
      )}
    </div>
  );
};

export default WaiverHeader; 