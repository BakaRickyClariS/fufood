import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectableChipProps = {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
};

const SelectableChip = ({
  label,
  selected,
  onClick,
  className,
}: SelectableChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
        selected
          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-200 hover:bg-neutral-50',
        className,
      )}
    >
      {selected && <Check className="w-3.5 h-3.5 mr-1.5" />}
      {label}
    </button>
  );
};

export default SelectableChip;
