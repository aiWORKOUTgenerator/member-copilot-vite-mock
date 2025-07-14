import React from 'react';
import { Dumbbell } from 'lucide-react';

interface ProfileHeaderProps {
  title?: string;
  description?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  title = "Profile Setup",
  description 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-600 text-sm ml-12">{description}</p>
      )}
    </div>
  );
};

export default ProfileHeader; 