import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { StepProps } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';

const PreferencesStep: React.FC<StepProps> = ({ 
  profileData, 
  onArrayToggle,
  getFieldError
}) => {
  const [showActivitiesInfo, setShowActivitiesInfo] = React.useState(false);
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

  const equipmentOptions: OptionConfig[] = [
    { 
      value: 'Gym Membership', 
      label: 'Gym Membership',
      description: 'Full access to a commercial gym facility with various equipment and amenities'
    },
    { 
      value: 'Home Gym', 
      label: 'Home Gym',
      description: 'Dedicated workout space with weights, machines, and other exercise equipment'
    },
    { 
      value: 'Dumbbells or Free Weights', 
      label: 'Dumbbells or Free Weights',
      description: 'Various handheld weights for strength training and muscle building'
    },
    { 
      value: 'Resistance Bands', 
      label: 'Resistance Bands',
      description: 'Elastic bands providing variable resistance for strength and mobility work'
    },
    { 
      value: 'Treadmill or Cardio Machines', 
      label: 'Treadmill or Cardio Machines',
      description: 'Access to treadmill, stationary bike, elliptical, or other cardio equipment'
    },
    { 
      value: 'Yoga Mat', 
      label: 'Yoga Mat',
      description: 'Exercise mat with optional accessories like straps, blocks, and blankets for floor work'
    },
    { 
      value: 'Body Weight', 
      label: 'Body Weight',
      description: 'No equipment needed - exercises using your own body weight for resistance'
    },
    { 
      value: 'Kettlebells', 
      label: 'Kettlebells',
      description: 'Weighted bells for dynamic strength training and conditioning exercises'
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
      value: 'Mountain Bike', 
      label: 'Mountain Bike',
      description: 'Bike suitable for off-road trails and varied terrain'
    },
    { 
      value: 'Road Bike (Cycling)', 
      label: 'Road Bike (Cycling)',
      description: 'Bike designed for road cycling and endurance training'
    }
  ];

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
            selectedValues={profileData.preferredActivities}
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
              Available Equipment
            </div>
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
                Select all equipment you have regular access to. This helps us create workouts that match your available resources.
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
                </ul>
              </div>
            </div>
          </div>

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
        </div>

        {/* Progress Indication */}
        {profileData.preferredActivities.length > 0 && profileData.availableEquipment.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Great! We'll create workouts based on your preferred activities and available equipment.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesStep; 