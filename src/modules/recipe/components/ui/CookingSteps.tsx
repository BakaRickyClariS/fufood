import type { CookingStep } from '@/modules/recipe/types';
import { Clock } from 'lucide-react';

interface CookingStepsProps {
  steps: CookingStep[];
}

export const CookingSteps = ({ steps }: CookingStepsProps) => {
  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div key={step.stepNumber} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
            {step.stepNumber}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-800 leading-relaxed mb-2">{step.description}</p>
            {step.time && (
              <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>{step.time}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
