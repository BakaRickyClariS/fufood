import type { CookingStep } from '@/modules/recipe/types';

type CookingStepsProps = {
  steps: CookingStep[];
};

export const CookingSteps = ({ steps }: CookingStepsProps) => {
  return (
    <div className="divide-y divide-gray-100">
      {steps.map((step) => (
        <div key={step.stepNumber} className="flex gap-4 py-6 first:pt-2">
          <div className="shrink-0">
            <span className="inline-block px-3 py-1 rounded-l-2xl rounded-br-2xl rounded-tr-sm bg-[#FFECEB] text-[#A13232] font-bold text-sm">
              步驟{step.stepNumber}
            </span>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-800 leading-relaxed mb-2 font-medium">
              {step.description.replace(/\$/g, '')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
