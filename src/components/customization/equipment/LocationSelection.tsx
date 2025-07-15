import React from 'react';
import { Activity, MapPin, Calendar } from 'lucide-react';
import { OptionGrid } from '../../shared/DRYComponents';
import { UserProfile } from '../../../types/user';

interface LocationSelectionProps {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
  userProfile?: UserProfile;
  aiSuggestions?: string[];
  onAIRecommendationApply?: (recommendation: any) => void;
}

const LocationSelection: React.FC<LocationSelectionProps> = ({
  selectedLocation,
  onLocationSelect,
  userProfile,
  aiSuggestions = [],
  onAIRecommendationApply
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Where will you be working out?</h3>
      <OptionGrid
        options={[
          { 
            value: 'gym', 
            label: 'Gym', 
            sublabel: 'Full equipment access', 
            metadata: { icon: Activity } 
          },
          { 
            value: 'home', 
            label: 'Home', 
            sublabel: 'Limited equipment', 
            metadata: { icon: MapPin } 
          },
          { 
            value: 'outdoor', 
            label: 'Outdoor', 
            sublabel: 'Natural environment', 
            metadata: { icon: Calendar } 
          }
        ]}
        selected={selectedLocation}
        onSelect={onLocationSelect}
        columns={{ base: 1, md: 3 }}
        aiRecommendations={aiSuggestions}
        onAIRecommendationApply={onAIRecommendationApply}
        userProfile={userProfile}
      />
    </div>
  );
};

export default LocationSelection; 