import React from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { StepProps, ProfileData } from '../../types/profile.types';
import { OptionGrid, OptionConfig } from '../../shared';
import ProfileHeader from '../ProfileHeader';

const PersonalInfoStep: React.FC<StepProps> = ({ 
  profileData, 
  onInputChange,
  onArrayToggle,
  getFieldError
}) => {
  const renderFieldError = (field: keyof ProfileData) => {
    const error = getFieldError ? getFieldError(field) : undefined;
    if (error) {
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      );
    }
    return null;
  };

  const cardiovascularOptions: OptionConfig[] = [
    { value: 'No', label: 'No' },
    { value: 'Yes - but cleared for exercise', label: 'Yes - but cleared for exercise' },
    { value: 'Yes - and need medical clearance', label: 'Yes - and need medical clearance' },
    { value: 'Prefer not to answer', label: 'Prefer not to answer' }
  ];

  const injuryOptions: OptionConfig[] = [
    { value: 'No Injuries', label: 'No, I do not have any injuries' },
    { value: 'Lower Back', label: 'Lower Back Pain/Injury' },
    { value: 'Knee', label: 'Knee Pain/Injury' },
    { value: 'Shoulder', label: 'Shoulder Pain/Injury' },
    { value: 'Neck', label: 'Neck Pain/Injury' },
    { value: 'Ankle', label: 'Ankle Sprain/Injury' },
    { value: 'Wrist or Elbow', label: 'Wrist or Elbow Pain/Injury' },
    { value: 'Hip', label: 'Hip Pain/Injury' },
    { value: 'Foot or Arch', label: 'Foot or Arch Pain/Injury' }
  ];

  const [showHealthInfo, setShowHealthInfo] = React.useState(false);

  return (
    <div className="space-y-8">
      <ProfileHeader 
        title="Personal Metrics & Health"
        description="Help us understand your physical characteristics and any health considerations"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Age
            </div>
            <select
              value={profileData.age}
              onChange={(e) => onInputChange('age', e.target.value)}
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
            {renderFieldError('age')}
          </div>

          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Gender
            </div>
            <select
              value={profileData.gender}
              onChange={(e) => onInputChange('gender', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {renderFieldError('gender')}
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
              onChange={(e) => onInputChange('height', e.target.value)}
              placeholder="e.g., 5'8&quot; or 173cm"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
            {renderFieldError('height')}
          </div>

          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Weight
            </div>
            <input
              type="text"
              value={profileData.weight}
              onChange={(e) => onInputChange('weight', e.target.value)}
              placeholder="e.g., 150 lbs or 68 kg"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
            {renderFieldError('weight')}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Health & Safety</h3>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm">
                  Have you ever been DIAGNOSED WITH OR SHOW SIGNS OF cardiovascular, renal, or metabolic diseases?
                </div>
                <button 
                  onClick={() => setShowHealthInfo(prev => !prev)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Toggle health information"
                >
                  <AlertCircle className="w-5 h-5 text-gray-500 hover:text-red-500" />
                </button>
              </div>

              {/* Health Information Panel */}
              <div className={`mb-6 bg-red-50 border border-red-100 rounded-lg p-6 ${showHealthInfo ? 'block' : 'hidden'}`}>
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-red-800 font-semibold mb-3">"Cardiovascular, renal, or metabolic diseases"</h4>
                  <p className="text-gray-700 mb-4">
                    This refers to any of the following doctor-diagnosed conditions or common warning signs. 
                    Answer "Yes" if you've ever been diagnosed with, or regularly experience, any of these:
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-red-700 font-medium mb-2">Cardiovascular (heart & blood vessels):</h5>
                      <ul className="list-none pl-4 space-y-1">
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          High blood pressure (hypertension)
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Heart attack, angina (chest pain), arrhythmias
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Shortness of breath during light activity or unexplained swelling in legs
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-red-700 font-medium mb-2">Renal (kidneys):</h5>
                      <ul className="list-none pl-4 space-y-1">
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Chronic kidney disease or impaired kidney function
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Dialysis treatment
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-red-700 font-medium mb-2">Metabolic (how your body uses energy):</h5>
                      <ul className="list-none pl-4 space-y-1">
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Diabetes (type 1 or type 2)
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          Thyroid disorders affecting metabolism
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-gray-700 mt-4 pt-4 border-t border-red-100">
                    If you're unsure whether a condition or symptom applies, check with your healthcare provider before beginning a new exercise program.
                  </p>
                </div>
              </div>

              <OptionGrid
                options={cardiovascularOptions}
                selectedValues={profileData.hasCardiovascularConditions}
                onSelect={(value: string) => onInputChange('hasCardiovascularConditions', value)}
                variant="default"
                columns={2}
                error={getFieldError ? getFieldError('hasCardiovascularConditions') : undefined}
                aria-label="Select your cardiovascular condition status"
              />
            </div>

            <div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm mb-4">
                Current Injuries (Select all that apply)
              </div>
              <OptionGrid
                options={injuryOptions}
                selectedValues={profileData.injuries}
                onSelect={(value: string) => onArrayToggle('injuries', value)}
                multiple={true}
                variant="default"
                columns={3}
                error={getFieldError ? getFieldError('injuries') : undefined}
                aria-label="Select your current injuries"
              />
            </div>

            {/* Health Summary */}
            {(profileData.hasCardiovascularConditions || profileData.injuries.length > 0) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-600 mr-3" />
                  <div className="text-red-800">
                    <div className="font-medium">Health Information Recorded</div>
                    <div className="text-sm">
                      {profileData.hasCardiovascularConditions && (
                        <span>Cardiovascular: {profileData.hasCardiovascularConditions}</span>
                      )}
                      {profileData.injuries.length > 0 && (
                        <span className="ml-2">Injuries: {profileData.injuries.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep; 