import React from 'react';
import { ProfileSectionProps } from '../types';

export const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  gradient 
}) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
    <div className="flex items-center mb-4">
      <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mr-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
); 