import React from 'react';
import { Clock } from 'lucide-react';

interface WorkingTimeDisplayProps {
  workingTime: number;
}

const WorkingTimeDisplay: React.FC<WorkingTimeDisplayProps> = ({ workingTime }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-blue-900">Actual Working Time</div>
          <div className="text-sm text-blue-700">
            {workingTime} minutes of focused exercise
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingTimeDisplay; 