import React from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { StepProps, LiabilityWaiverData } from '../../types/liability-waiver.types';

const PersonalInfoStep: React.FC<StepProps> = ({ 
  waiverData, 
  onInputChange,
  getFieldError
}) => {
  const renderFieldError = (field: keyof LiabilityWaiverData) => {
    const error = getFieldError ? getFieldError(field) : undefined;
    if (error) {
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
      </div>
      <p className="text-gray-600 mb-6">Required for Group Fitness and Personal Training</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Full Legal Name
            </div>
            <input
              type="text"
              value={waiverData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
            {renderFieldError('fullName')}
          </div>

          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Date of Birth
            </div>
            <input
              type="date"
              value={waiverData.dateOfBirth}
              onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
            {renderFieldError('dateOfBirth')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Emergency Contact Name
            </div>
            <input
              type="text"
              value={waiverData.emergencyContactName}
              onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
              placeholder="Emergency contact full name"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
            {renderFieldError('emergencyContactName')}
          </div>

          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
              Emergency Contact Phone
            </div>
            <input
              type="tel"
              value={waiverData.emergencyContactPhone}
              onChange={(e) => onInputChange('emergencyContactPhone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
            {renderFieldError('emergencyContactPhone')}
          </div>
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Medical Conditions (Optional)
          </div>
          <textarea
            value={waiverData.medicalConditions}
            onChange={(e) => onInputChange('medicalConditions', e.target.value)}
            placeholder="List any medical conditions, injuries, or physical limitations that may affect your ability to exercise safely"
            rows={4}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none resize-none"
          />
          {renderFieldError('medicalConditions')}
        </div>

        <div>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
            Current Medications (Optional)
          </div>
          <textarea
            value={waiverData.medications}
            onChange={(e) => onInputChange('medications', e.target.value)}
            placeholder="List any medications you are currently taking that may affect your exercise performance or safety"
            rows={3}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none resize-none"
          />
          {renderFieldError('medications')}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Medical Clearance</h4>
              <p className="text-sm text-yellow-700">
                If you have any medical conditions, injuries, or take medications that may affect your ability to exercise safely, 
                please consult with your physician before beginning any exercise program.
                <br />  
                <br />
                <p>✅ Obtained medical clearance from my physician to participate in the activities described above, or</p>
                <p>⚠️ Voluntarily chosen to proceed without such clearance and hereby assume all risks associated with my participation.</p>
                <br />
            
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={waiverData.physicianApproval}
                onChange={(e) => onInputChange('physicianApproval', e.target.checked)}
                className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <span className="text-sm text-yellow-800">
              I confirm I have consulted with my physician and been cleared for exercise OR I understand the risks, have elected not to seek medical clearance, and assume full responsibility for my participation.
              </span>
            </label>
          </div>
        </div>

        {/* Progress Indication */}
        {waiverData.physicianApproval && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">
                Medical clearance confirmed. Ready to proceed.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep; 