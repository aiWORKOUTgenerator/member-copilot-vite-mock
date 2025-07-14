import React from 'react';
import { Eye, ChevronLeft, ChevronRight, User, Target, Dumbbell, Clock, Activity, Heart, Zap, Battery, AlertTriangle, CheckCircle, XCircle, LucideIcon } from 'lucide-react';

interface ReviewPageProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ onNavigate }) => {
  // Mock data - in a real app, this would come from state management or props
  const profileData = {
    experienceLevel: 'Some Experience',
    physicalActivity: 'Moderately Active',
    primaryGoal: 'Increase Strength',
    goalTimeline: '12 Weeks',
    age: '28',
    height: '5′ 10″',
    weight: '175',
    gender: 'Male',
    preferredDuration: '45 Minutes',
    intensityLevel: 'Moderately Active to Active',
    workoutType: 'Strength Training',
    availableEquipment: ['Gym Membership (full access)', 'Dumbbells or Free Weights'],
    injuries: ['No, I do not have any injuries that will affect my ability to perform exercise'],
    hasCardiovascularConditions: 'No'
  };

  const workoutFocusData = {
    workoutFocus: 'Strength Building',
    workoutIntensity: 'Moderate Intensity',
    workoutType: 'Straight Sets',
    duration: '45 minutes',
    focusAreas: ['Upper Body', 'Lower Body'],
    equipment: ['Full Gym', 'Dumbbells'],
    energyLevel: 'Moderate Energy',
    currentSoreness: ['No Soreness'],
    includeExercises: ['Squats', 'Deadlifts', 'Bench Press'],
    excludeExercises: []
  };

  const ProfileSection = ({ title, icon: Icon, children, gradient }: { title: string; icon: LucideIcon; children: React.ReactNode; gradient: string }) => (
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

  const DataRow = ({ label, value, icon: Icon }: { label: string; value: string | string[]; icon?: LucideIcon }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-medium text-right">
        {Array.isArray(value) ? (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <span className="bg-gray-50 px-2 py-1 rounded">{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Eye className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Selections</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Confirm your profile and workout preferences before generating your personalized routine
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Framework Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Fitness Profile</h2>
              <p className="text-gray-600">The foundation that shapes your workout framework</p>
            </div>

            {/* Experience & Goals */}
            <ProfileSection title="Experience & Goals" icon={Target} gradient="from-blue-500 to-purple-500">
              <div className="space-y-3">
                <DataRow label="Experience Level" value={profileData.experienceLevel} icon={User} />
                <DataRow label="Current Activity" value={profileData.physicalActivity} icon={Activity} />
                <DataRow label="Primary Goal" value={profileData.primaryGoal} icon={Target} />
                <DataRow label="Timeline" value={profileData.goalTimeline} icon={Clock} />
              </div>
            </ProfileSection>

            {/* Physical Metrics */}
            <ProfileSection title="Physical Metrics" icon={User} gradient="from-green-500 to-teal-500">
              <div className="space-y-3">
                <DataRow label="Age" value={`${profileData.age} years`} />
                <DataRow label="Height" value={profileData.height} />
                <DataRow label="Weight" value={`${profileData.weight} lbs`} />
                <DataRow label="Gender" value={profileData.gender} />
              </div>
            </ProfileSection>

            {/* Workout Preferences */}
            <ProfileSection title="Workout Framework" icon={Dumbbell} gradient="from-orange-500 to-red-500">
              <div className="space-y-3">
                <DataRow label="Preferred Duration" value={profileData.preferredDuration} icon={Clock} />
                <DataRow label="Intensity Level" value={profileData.intensityLevel} icon={Zap} />
                <DataRow label="Workout Type" value={profileData.workoutType} icon={Dumbbell} />
                <DataRow label="Available Equipment" value={profileData.availableEquipment} />
              </div>
            </ProfileSection>

            {/* Health & Safety */}
            <ProfileSection title="Health & Safety" icon={Heart} gradient="from-red-500 to-pink-500">
              <div className="space-y-3">
                <DataRow 
                  label="Cardiovascular Conditions" 
                  value={profileData.hasCardiovascularConditions} 
                  icon={profileData.hasCardiovascularConditions === 'No' ? CheckCircle : AlertTriangle}
                />
                <DataRow 
                  label="Current Injuries" 
                  value={profileData.injuries} 
                  icon={profileData.injuries[0].includes('No') ? CheckCircle : AlertTriangle}
                />
              </div>
            </ProfileSection>
          </div>

          {/* Today's Workout Focus Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Workout Focus</h2>
              <p className="text-gray-600">Your specific selections for this workout session</p>
            </div>

            {/* Workout Basics */}
            <ProfileSection title="Workout Basics" icon={Target} gradient="from-purple-500 to-indigo-500">
              <div className="space-y-3">
                <DataRow label="Primary Focus" value={workoutFocusData.workoutFocus} icon={Target} />
                <DataRow label="Intensity" value={workoutFocusData.workoutIntensity} icon={Zap} />
                <DataRow label="Energy Level" value={workoutFocusData.energyLevel} icon={Battery} />
                <DataRow label="Duration" value={workoutFocusData.duration} icon={Clock} />
              </div>
            </ProfileSection>

            {/* Training Details */}
            <ProfileSection title="Training Details" icon={Activity} gradient="from-teal-500 to-blue-500">
              <div className="space-y-3">
                <DataRow label="Workout Type" value={workoutFocusData.workoutType} icon={Activity} />
                <DataRow label="Focus Areas" value={workoutFocusData.focusAreas} />
                <DataRow label="Current Soreness" value={workoutFocusData.currentSoreness} icon={AlertTriangle} />
              </div>
            </ProfileSection>

            {/* Equipment & Exercises */}
            <ProfileSection title="Equipment & Exercises" icon={Dumbbell} gradient="from-yellow-500 to-orange-500">
              <div className="space-y-3">
                <DataRow label="Equipment Available" value={workoutFocusData.equipment} icon={Dumbbell} />
                {workoutFocusData.includeExercises.length > 0 && (
                  <DataRow label="Preferred Exercises" value={workoutFocusData.includeExercises} icon={CheckCircle} />
                )}
                {workoutFocusData.excludeExercises.length > 0 && (
                  <DataRow label="Exercises to Avoid" value={workoutFocusData.excludeExercises} icon={XCircle} />
                )}
              </div>
            </ProfileSection>

            {/* Workout Summary Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Workout Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="opacity-80">Focus</div>
                  <div className="font-medium">{workoutFocusData.workoutFocus}</div>
                </div>
                <div>
                  <div className="opacity-80">Duration</div>
                  <div className="font-medium">{workoutFocusData.duration}</div>
                </div>
                <div>
                  <div className="opacity-80">Intensity</div>
                  <div className="font-medium">{workoutFocusData.workoutIntensity}</div>
                </div>
                <div>
                  <div className="opacity-80">Type</div>
                  <div className="font-medium">{workoutFocusData.workoutType}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 max-w-4xl mx-auto">
          <button 
            onClick={() => onNavigate('focus')}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Back to Workout Focus</span>
          </button>
          
          <button 
            onClick={() => onNavigate('results')}
            className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <span className="text-lg">Generate My Workout</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Edit Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button 
            onClick={() => onNavigate('profile')}
            className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
          >
            Edit Profile Information
          </button>
          <button 
            onClick={() => onNavigate('focus')}
            className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors duration-200"
          >
            Modify Workout Focus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;