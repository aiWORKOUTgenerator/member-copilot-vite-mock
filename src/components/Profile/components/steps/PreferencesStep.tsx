import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';
import { createEquipmentOptions } from '../../../../config/equipmentOptions';
import { DynamicEquipmentService } from '../../../../utils/dynamicEquipmentService';

const PreferencesStep: React.FC<StepProps> = ({ 
  profileData, 
  onArrayToggle,
  getFieldError
}) => {
  const [showActivitiesInfo, setShowActivitiesInfo] = React.useState(false);
  const [showLocationsInfo, setShowLocationsInfo] = React.useState(false);
  const [showEquipmentInfo, setShowEquipmentInfo] = React.useState(false);

  const activityOptions: OptionConfig[] = [
    { 
      value: 'Walking/Power Walking', 
      label: 'Walking/Power Walking',
      description: 'Low-impact cardiovascular exercise at various paces, from casual walking to brisk power walking'
    },
    { 
      value: 'Running/Jogging', 
      label: 'Running/Jogging',
      description: 'Cardiovascular exercise at various paces, from casual jogging to intense running, great for endurance and heart health'
    },
    { 
      value: 'Swimming', 
      label: 'Swimming',
      description: 'Full-body, low-impact workout in the water, excellent for cardio and muscle conditioning'
    },
    { 
      value: 'Cycling/Mountain Biking', 
      label: 'Cycling/Mountain Biking',
      description: 'Road cycling or off-road biking for cardio, leg strength, and outdoor adventure'
    },
    { 
      value: 'Rock Climbing/Bouldering', 
      label: 'Rock Climbing/Bouldering',
      description: 'Dynamic full-body workout combining strength, balance, and problem-solving skills'
    },
    { 
      value: 'Yoga', 
      label: 'Yoga',
      description: 'Mind-body practice combining physical postures, breathing techniques, and meditation'
    },
    { 
      value: 'Pilates', 
      label: 'Pilates',
      description: 'Core-strengthening exercises focusing on control, precision, and flowing movement patterns'
    },
    { 
      value: 'Hiking', 
      label: 'Hiking',
      description: 'Outdoor walking on natural terrain, combining cardio with the benefits of nature'
    },
    { 
      value: 'Dancing', 
      label: 'Dancing',
      description: 'Rhythmic movement including styles like Zumba, Hip-Hop, and other dance fitness formats'
    },
    { 
      value: 'Team Sports', 
      label: 'Team Sports',
      description: 'Group activities like Basketball, Soccer, or Softball that combine fitness with social interaction'
    },
    { 
      value: 'Golf', 
      label: 'Golf',
      description: 'Precision sport combining walking, core rotation, and focused movement patterns'
    },
    { 
      value: 'Martial Arts', 
      label: 'Martial Arts',
      description: 'Combat sports and self-defense practices that build strength, flexibility, and mental discipline'
    }
  ];

  const locationOptions: OptionConfig[] = [
    { 
      value: 'Gym', 
      label: 'Gym',
      description: 'Commercial gym facility with full equipment access'
    },
    { 
      value: 'Home Gym', 
      label: 'Home Gym',
      description: 'Dedicated workout space with equipment at home'
    },
    { 
      value: 'Home', 
      label: 'Home',
      description: 'General home space for body weight and light equipment exercises'
    },
    { 
      value: 'Parks/Outdoor Spaces', 
      label: 'Parks/Outdoor Spaces',
      description: 'Outdoor areas suitable for exercise, including trails, parks, and recreation spaces'
    },
    { 
      value: 'Swimming Pool', 
      label: 'Swimming Pool',
      description: 'Access to a pool for swimming laps and water-based exercises'
    },
    { 
      value: 'Running Track', 
      label: 'Running Track',
      description: 'Dedicated track for running and track-based workouts'
    }
  ];

  // Dynamic equipment options based on selected locations
  const equipmentOptions = React.useMemo(() => {
    if (!profileData?.availableLocations) {
      return [];
    }
    return createEquipmentOptions(profileData.availableLocations);
  }, [profileData?.availableLocations]);
  
  // Auto-select default equipment when locations change
  React.useEffect(() => {
    if (profileData?.availableLocations?.length > 0 && profileData?.availableEquipment?.length === 0) {
      const defaultEquipment = DynamicEquipmentService.getDefaultEquipmentForLocations(
        profileData.availableLocations
      );
      defaultEquipment.forEach(equipment => {
        onArrayToggle('availableEquipment', equipment);
      });
    }
  }, [profileData?.availableLocations, profileData?.availableEquipment?.length, onArrayToggle]);
  
  // Clear equipment when locations are cleared
  React.useEffect(() => {
    if (profileData?.availableLocations?.length === 0 && profileData?.availableEquipment?.length > 0) {
      // Clear equipment selection when no locations are selected
      profileData.availableEquipment.forEach(equipment => {
        onArrayToggle('availableEquipment', equipment);
      });
    }
  }, [profileData?.availableLocations?.length, profileData?.availableEquipment, onArrayToggle]);

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Exercise Preferences & Resources"
        description="Tell us about the activities you enjoy and the equipment you have access to"
      />

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm">
              Activities You Enjoy
            </div>
            <button 
              onClick={() => setShowActivitiesInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle activities information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors" />
            </button>
          </div>

          {/* Activities Information Panel */}
          <div className={`mb-6 bg-purple-50 border border-purple-100 rounded-lg p-6 ${showActivitiesInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-purple-800 font-semibold mb-3">Activities You Enjoy</h4>
              <p className="text-gray-700 mb-4">
                Select activities you enjoy or would like to try. We'll incorporate these into your workout plans to make them more engaging and sustainable.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">Your selections help us:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Create personalized workout plans that match your interests
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Suggest new activities that align with your preferences
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Balance variety and familiarity in your routines
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <OptionGrid
            options={activityOptions}
            selectedValues={profileData?.preferredActivities || []}
            onSelect={(value: string) => onArrayToggle('preferredActivities', value)}
            multiple={true}
            columns={3}
            variant="default"
            useTooltips={true}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('preferredActivities') : undefined}
            aria-label="Select activities you enjoy"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm">
              Available Training Locations
            </div>
            <button 
              onClick={() => setShowLocationsInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle locations information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors" />
            </button>
          </div>

          {/* Locations Information Panel */}
          <div className={`mb-6 bg-purple-50 border border-purple-100 rounded-lg p-6 ${showLocationsInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-purple-800 font-semibold mb-3">Available Training Locations</h4>
              <p className="text-gray-700 mb-4">
                Select all locations where you can regularly exercise. This helps us create workouts that match your available spaces and environments.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">Your selections help us:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Design workouts appropriate for your training environments
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Consider space constraints and exercise modifications
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Suggest location-specific workout variations
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <OptionGrid
            options={locationOptions}
            selectedValues={profileData?.availableLocations || []}
            onSelect={(value: string) => onArrayToggle('availableLocations', value)}
            multiple={true}
            columns={3}
            variant="default"
            useTooltips={true}
            className="[&_button]:w-full"
            error={getFieldError ? getFieldError('availableLocations') : undefined}
            aria-label="Select your available training locations"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm">
              Available Equipment
            </div>
            {profileData?.availableLocations?.length > 0 && (
              <span className="text-sm text-gray-600">
                Based on your selected locations
              </span>
            )}
            <button 
              onClick={() => setShowEquipmentInfo(prev => !prev)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle equipment information"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 hover:text-purple-500 transition-colors" />
            </button>
          </div>

          {/* Equipment Information Panel */}
          <div className={`mb-6 bg-purple-50 border border-purple-100 rounded-lg p-6 ${showEquipmentInfo ? 'block' : 'hidden'}`}>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-purple-800 font-semibold mb-3">Available Equipment</h4>
              <p className="text-gray-700 mb-4">
                {profileData.availableLocations.length > 0 
                  ? 'Equipment options are automatically filtered based on your selected training locations. This ensures workouts only use equipment you actually have access to.'
                  : 'Select training locations first to see relevant equipment options for your workout environment.'
                }
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">Why this matters:</p>
                <ul className="list-none pl-4 space-y-1">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Ensures workouts only use equipment you have access to
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Helps optimize exercise selection for your setup
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Allows for alternative suggestions when equipment is limited
                  </li>
                  {profileData.availableLocations.length > 0 && (
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Automatically suggests appropriate equipment for your locations
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {profileData.availableLocations.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Please select training locations first to see relevant equipment options.
              </p>
            </div>
          ) : (
            <OptionGrid
              options={equipmentOptions}
              selectedValues={profileData.availableEquipment}
              onSelect={(value: string) => onArrayToggle('availableEquipment', value)}
              multiple={true}
              columns={3}
              variant="default"
              useTooltips={true}
              className="[&_button]:w-full"
              error={getFieldError ? getFieldError('availableEquipment') : undefined}
              aria-label="Select your available equipment"
            />
          )}
        </div>

        {/* Progress Indication */}
        {profileData.preferredActivities.length > 0 && profileData.availableLocations.length > 0 && profileData.availableEquipment.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Great! We'll create workouts based on your preferred activities, training locations, and available equipment.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesStep; 