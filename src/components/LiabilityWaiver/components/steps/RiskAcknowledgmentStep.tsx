import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { StepProps, LiabilityWaiverData } from '../../types/liability-waiver.types';

const RiskAcknowledgmentStep: React.FC<StepProps> = ({ 
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

  const acknowledgments = [
    {
      field: 'understandRisks' as keyof LiabilityWaiverData,
      title: 'I acknowledge and understand',
      description: 'that I have been informed of the potential risks associated with exercise and physical activity. I understand that these risks cannot be eliminated and that injuries can occur even when proper precautions are taken.'
    },
    {
      field: 'assumeResponsibility' as keyof LiabilityWaiverData,
      title: 'I voluntarily assume full responsibility',
      description: 'for any risks of loss, property damage, or personal injury that may be sustained as a result of participating in exercise activities, whether caused by negligence or otherwise.'
    },
    {
      field: 'followInstructions' as keyof LiabilityWaiverData,
      title: 'I agree to follow all instructions',
      description: 'and exercise within my physical limitations. I will stop exercising immediately if I experience any pain, discomfort, or unusual symptoms.'
    },
    {
      field: 'reportInjuries' as keyof LiabilityWaiverData,
      title: 'I agree to immediately report',
      description: 'any injuries, accidents, or adverse reactions that occur during or as a result of my participation in exercise activities.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Risk Acknowledgment</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Understanding Exercise Risks</h3>
          <div className="space-y-3 text-sm text-red-700">
            <p>
              I understand that participation in any exercise program involves certain inherent risks including, but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Muscle strains, sprains, and other soft tissue injuries</li>
              <li>Bone fractures and joint injuries</li>
              <li>Cardiovascular complications including heart attack</li>
              <li>Respiratory difficulties</li>
              <li>Equipment-related injuries</li>
              <li>Aggravation of pre-existing conditions</li>
              <li>In rare cases, serious injury or death</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {acknowledgments.map((acknowledgment) => (
            <div key={acknowledgment.field} className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={waiverData[acknowledgment.field] as boolean}
                  onChange={(e) => onInputChange(acknowledgment.field, e.target.checked)}
                  className="mr-3 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-0.5"
                  required
                />
                <span className="text-gray-800">
                  <strong>{acknowledgment.title}</strong> {acknowledgment.description}
                </span>
              </label>
              {renderFieldError(acknowledgment.field)}
            </div>
          ))}
        </div>

        {/* Progress Indication */}
        {waiverData.understandRisks && waiverData.assumeResponsibility && waiverData.followInstructions && waiverData.reportInjuries && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                All risk acknowledgments have been completed. You understand and accept the risks involved.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAcknowledgmentStep; 