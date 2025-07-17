import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { StepProps, LiabilityWaiverData } from '../../types/liability-waiver.types';

const ReleaseSignatureStep: React.FC<StepProps> = ({ 
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-red-600 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Release & Signature</h2>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Toggle information"
          >
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-2 p-4 bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">About Electronic Signatures</h3>
            <div className="space-y-2 text-sm text-purple-700">
              <p>Your electronic signature on this document:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Is legally binding and equivalent to a handwritten signature</li>
                <li>Confirms you have read and understood all terms</li>
                <li>Represents your voluntary agreement to all conditions</li>
                <li>Cannot be disputed or retracted without proper cause</li>
                <li>Is securely stored with timestamp verification</li>
              </ul>
              <p className="mt-2">Please ensure all information is accurate before signing.</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Release of Liability</h3>
          <div className="text-sm text-purple-700 space-y-3">
            <p>
              In consideration for being allowed to participate in exercise activities and use of facilities, 
              I hereby release, waive, discharge, and covenant not to sue the AI Workout Generator, its owners, 
              employees, agents, and representatives from any and all liability, claims, demands, actions, 
              and causes of action whatsoever arising out of or related to any loss, damage, or injury 
              that may be sustained while participating in such activities.
            </p>
            <p>
              This release shall be binding upon my heirs, executors, administrators, and assigns. 
              I have read this waiver of liability and assumption of risk agreement, fully understand its terms, 
              and understand that I am giving up substantial rights, including my right to sue.
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={waiverData.releaseFromLiability}
              onChange={(e) => onInputChange('releaseFromLiability', e.target.checked)}
              className="mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
              required
            />
            <span className="text-gray-800">
              <strong>I hereby release and hold harmless</strong> the AI Workout Generator and all associated parties 
              from any liability, claims, or damages arising from my participation in exercise activities. 
              I understand this is a complete release of liability.
            </span>
          </label>
          {renderFieldError('releaseFromLiability')}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Electronic Signature</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                Digital Signature *
              </div>
              <input
                type="text"
                value={waiverData.signature}
                onChange={(e) => onInputChange('signature', e.target.value)}
                placeholder="Type your full name as your digital signature"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                By typing your name, you are providing a legally binding electronic signature
              </p>
              {renderFieldError('signature')}
            </div>

            <div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-red-600 text-white text-sm font-medium rounded-md shadow-sm mb-3">
                Date
              </div>
              <input
                type="date"
                value={waiverData.signatureDate}
                onChange={(e) => onInputChange('signatureDate', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              {renderFieldError('signatureDate')}
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">Legal Agreement</h4>
                <p className="text-sm text-green-700">
                  By providing your electronic signature above, you acknowledge that you have read, 
                  understood, and agree to be bound by all terms of this liability waiver and release agreement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indication */}
        {waiverData.releaseFromLiability && waiverData.signature && waiverData.signatureDate && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Liability waiver completed successfully. You may now proceed to the next step.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseSignatureStep; 