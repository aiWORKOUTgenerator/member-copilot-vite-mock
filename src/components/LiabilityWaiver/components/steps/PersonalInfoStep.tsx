import React, { useState } from 'react';
import { User, AlertTriangle, AlertCircle } from 'lucide-react';
import { StepProps, LiabilityWaiverData } from '../../types/liability-waiver.types';

interface FieldLabelProps {
  title: string;
  infoContent: {
    title: string;
    description: string;
    points?: string[];
  };
  optional?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = ({ title, infoContent, optional }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-2">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-md shadow-sm">
          {title} {optional && '(Optional)'}
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={`Toggle ${title} information`}
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
        </button>
      </div>
      
      {showInfo && (
        <div className="absolute z-10 mt-2 p-3 bg-red-50 border border-red-100 rounded-lg shadow-lg w-72">
          <h4 className="text-sm font-semibold text-red-800 mb-2">{infoContent.title}</h4>
          <div className="text-xs text-red-700">
            <p>{infoContent.description}</p>
            {infoContent.points && (
              <ul className="list-disc list-inside space-y-1 mt-2">
                {infoContent.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PersonalInfoStep: React.FC<StepProps> = ({ 
  waiverData, 
  onInputChange,
  getFieldError
}) => {
  const [showInfo, setShowInfo] = useState(false);

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
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Toggle information"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-2 p-4 bg-red-50 border border-red-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Why We Need This Information</h3>
            <div className="space-y-2 text-sm text-red-700">
              <p>This information is essential for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ensuring your safety during workouts</li>
                <li>Providing appropriate exercise recommendations</li>
                <li>Contacting emergency services if needed</li>
                <li>Maintaining accurate medical records</li>
                <li>Complying with legal and insurance requirements</li>
              </ul>
              <p className="mt-2 font-medium">Note: This information is only required for users participating in online group classes and personal training. It is not required for AI-generated workouts.</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-6">Required for Group Fitness and Personal Training</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel 
              title="Full Legal Name"
              infoContent={{
                title: "Legal Name Requirement",
                description: "Your full legal name is required for:",
                points: [
                  "Identity verification",
                  "Legal documentation",
                  "Emergency contact purposes",
                  "Insurance requirements"
                ]
              }}
            />
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
            <FieldLabel 
              title="Date of Birth"
              infoContent={{
                title: "Age Verification",
                description: "Your date of birth helps us:",
                points: [
                  "Verify eligibility for participation",
                  "Provide age-appropriate exercises",
                  "Ensure proper safety protocols",
                  "Comply with legal requirements"
                ]
              }}
            />
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
            <FieldLabel 
              title="Emergency Contact Name"
              infoContent={{
                title: "Emergency Contact Information",
                description: "A reliable emergency contact is crucial for:",
                points: [
                  "Immediate notification in emergencies",
                  "Medical authorization if needed",
                  "Required for in-person training",
                  "Part of our safety protocol"
                ]
              }}
            />
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
            <FieldLabel 
              title="Emergency Contact Phone"
              infoContent={{
                title: "Emergency Contact Number",
                description: "A valid phone number is required to:",
                points: [
                  "Quickly reach your contact in emergencies",
                  "Ensure immediate response capability",
                  "Must be currently active and accessible",
                  "Preferably a mobile number"
                ]
              }}
            />
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
          <FieldLabel 
            title="Medical Conditions"
            infoContent={{
              title: "Health Conditions & Limitations",
              description: "Share relevant medical information to:",
              points: [
                "Ensure safe exercise programming",
                "Avoid potentially harmful activities",
                "Help trainers modify workouts appropriately",
                "Maintain your safety during sessions"
              ]
            }}
            optional
          />
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
          <FieldLabel 
            title="Current Medications"
            infoContent={{
              title: "Medication Information",
              description: "Medication details help us:",
              points: [
                "Understand potential exercise limitations",
                "Be aware of possible side effects",
                "Ensure proper emergency response",
                "Modify workouts if needed"
              ]
            }}
            optional
          />
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