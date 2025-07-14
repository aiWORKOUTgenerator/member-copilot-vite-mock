import React, { useState } from 'react';
import { User, ChevronLeft, ChevronRight, Target, Clock, Dumbbell, Activity, Heart } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

interface ProfilePageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

interface ProfileData {
  experienceLevel: string;
  physicalActivity: string;
  preferredDuration: string;
  timeCommitment: string;
  intensityLevel: string;
  workoutType: string;
  preferredActivities: string[];
  availableEquipment: string[];
  primaryGoal: string;
  goalTimeline: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  hasCardiovascularConditions: string;
  injuries: string[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = usePersistedState<ProfileData>('profileData', {
    experienceLevel: '',
    physicalActivity: '',
    preferredDuration: '',
    timeCommitment: '',
    intensityLevel: '',
    workoutType: '',
    preferredActivities: [],
    availableEquipment: [],
    primaryGoal: '',
    goalTimeline: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    hasCardiovascularConditions: '',
    injuries: []
  });

  const totalSteps = 5;

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof ProfileData, value: string) => {
    const currentArray = profileData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Profile Data:', profileData);
    onNavigate('focus');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Experience & Activity</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Experience Level
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleInputChange('experienceLevel', level)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profileData.experienceLevel === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{level}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Current Physical Activity Level
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                    { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                    { value: 'very', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' }
                  ].map((activity) => (
                    <button
                      key={activity.value}
                      onClick={() => handleInputChange('physicalActivity', activity.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        profileData.physicalActivity === activity.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{activity.label}</div>
                      <div className="text-sm text-gray-500">{activity.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Time & Commitment</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Preferred Workout Duration
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['15-30 min', '30-45 min', '45-60 min', '60+ min'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleInputChange('preferredDuration', duration)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profileData.preferredDuration === duration
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-center">{duration}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Time Commitment
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: '2-3', label: '2-3 days per week', desc: 'Light commitment' },
                    { value: '3-4', label: '3-4 days per week', desc: 'Moderate commitment' },
                    { value: '4-5', label: '4-5 days per week', desc: 'High commitment' },
                    { value: '6-7', label: '6-7 days per week', desc: 'Maximum commitment' }
                  ].map((commitment) => (
                    <button
                      key={commitment.value}
                      onClick={() => handleInputChange('timeCommitment', commitment.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        profileData.timeCommitment === commitment.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{commitment.label}</div>
                      <div className="text-sm text-gray-500">{commitment.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Target Activity Level
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Low Intensity', desc: 'Gentle, easy-paced workouts' },
                    { value: 'moderate', label: 'Moderate Intensity', desc: 'Balanced challenge level' },
                    { value: 'high', label: 'High Intensity', desc: 'Challenging, vigorous workouts' }
                  ].map((intensity) => (
                    <button
                      key={intensity.value}
                      onClick={() => handleInputChange('intensityLevel', intensity.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        profileData.intensityLevel === intensity.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{intensity.label}</div>
                      <div className="text-sm text-gray-500">{intensity.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Exercise Preferences & Resources</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Preferred Workout Type
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'strength', label: 'Strength Training', desc: 'Build muscle and power' },
                    { value: 'cardio', label: 'Cardiovascular', desc: 'Improve heart health and endurance' },
                    { value: 'flexibility', label: 'Flexibility & Mobility', desc: 'Enhance range of motion' },
                    { value: 'mixed', label: 'Mixed Training', desc: 'Combination of all types' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('workoutType', type.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        profileData.workoutType === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Activities You Enjoy (Select all that apply)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Running', 'Walking', 'Cycling', 'Swimming', 'Yoga', 'Pilates',
                    'Weight Lifting', 'Bodyweight', 'Dancing', 'Sports', 'Hiking', 'Martial Arts'
                  ].map((activity) => (
                    <button
                      key={activity}
                      onClick={() => handleArrayToggle('preferredActivities', activity)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        profileData.preferredActivities.includes(activity)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-center">{activity}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Available Equipment
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'None (Bodyweight)', 'Dumbbells', 'Resistance Bands', 'Yoga Mat',
                    'Pull-up Bar', 'Kettlebells', 'Barbell', 'Gym Access'
                  ].map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => handleArrayToggle('availableEquipment', equipment)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        profileData.availableEquipment.includes(equipment)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-center">{equipment}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Goals & Timeline</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Primary Goal
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'weight-loss', label: 'Weight Loss', desc: 'Reduce body weight and fat' },
                    { value: 'muscle-gain', label: 'Muscle Gain', desc: 'Build lean muscle mass' },
                    { value: 'endurance', label: 'Improve Endurance', desc: 'Enhance cardiovascular fitness' },
                    { value: 'strength', label: 'Increase Strength', desc: 'Build power and strength' },
                    { value: 'flexibility', label: 'Improve Flexibility', desc: 'Enhance mobility and range of motion' },
                    { value: 'general', label: 'General Fitness', desc: 'Overall health and wellness' }
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => handleInputChange('primaryGoal', goal.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        profileData.primaryGoal === goal.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-sm text-gray-500">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                  Goal Timeline
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['1 month', '3 months', '6 months', '1 year+'].map((timeline) => (
                    <button
                      key={timeline}
                      onClick={() => handleInputChange('goalTimeline', timeline)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profileData.goalTimeline === timeline
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-center">{timeline}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-green-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Personal Metrics & Health</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                    Age
                  </div>
                  <select
                    value={profileData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Select age range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="56-65">56-65</option>
                    <option value="65+">65+</option>
                  </select>
                </div>

                <div>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                    Gender
                  </div>
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                    Height
                  </div>
                  <input
                    type="text"
                    value={profileData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 5'8&quot; or 173cm"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                    Weight
                  </div>
                  <input
                    type="text"
                    value={profileData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 150 lbs or 68 kg"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Health & Safety</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                      Do you have any cardiovascular conditions?
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['No', 'Yes - cleared for exercise', 'Yes - need medical clearance', 'Prefer not to answer'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleInputChange('hasCardiovascularConditions', option)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            profileData.hasCardiovascularConditions === option
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{option}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                      Current Injuries (Select all that apply)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'None', 'Back', 'Knee', 'Shoulder', 'Ankle', 'Wrist',
                        'Hip', 'Neck', 'Elbow', 'Other'
                      ].map((injury) => (
                        <button
                          key={injury}
                          onClick={() => handleArrayToggle('injuries', injury)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            profileData.injuries.includes(injury)
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-center">{injury}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Create Your Fitness Profile</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us understand your fitness journey so we can create the perfect workout plan tailored just for you.
            </p>
          </div>

          {/* Section Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { step: 1, title: 'Experience & Activity', color: 'from-blue-500 to-purple-600' },
                { step: 2, title: 'Time & Commitment', color: 'from-green-500 to-blue-600' },
                { step: 3, title: 'Preferences & Resources', color: 'from-purple-500 to-pink-600' },
                { step: 4, title: 'Goals & Timeline', color: 'from-orange-500 to-red-600' },
                { step: 5, title: 'Metrics & Health', color: 'from-teal-500 to-green-600' }
              ].map((section) => (
                <button
                  key={section.step}
                  onClick={() => setCurrentStep(section.step)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentStep === section.step
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                      : 'bg-white/60 text-gray-600 hover:bg-white/80 hover:text-gray-800 border border-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Complete Profile
                <Target className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;