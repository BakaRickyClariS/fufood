import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type FloatingActionButtonProps = {
  onClick?: () => void;
  className?: string;
};

export const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-4 z-50",
        "w-14 h-14 rounded-full bg-neutral-50 text-neutral-900 shadow-lg",
        "flex items-center justify-center transition-transform active:scale-95",
        "hover:bg-neutral-100",
        className
      )}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};
