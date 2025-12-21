import type { CookingStep } from '@/modules/recipe/types';
import { Clock } from 'lucide-react';

type CookingStepsProps = {
  steps: CookingStep[];
};

export const CookingSteps = ({ steps }: CookingStepsProps) => {
  return (
    <div className="space-y-8">
      {steps.map((step) => (
        <div key={step.stepNumber} className="flex gap-4">
          <div className="flex-shrink-0">
            <span className="inline-block px-3 py-1 rounded-lg bg-[#FFECEB] text-[#F5655D] font-bold text-sm">
              步驟{step.stepNumber}
            </span>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-800 leading-relaxed mb-2 font-medium">
              {step.description.replace(/\$/g, '')}
            </p>
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
