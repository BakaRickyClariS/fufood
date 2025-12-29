import { ChevronLeft } from 'lucide-react';

type SimpleHeaderProps = {
  title: string;
  onBack: () => void;
};

const SimpleHeader = ({ title, onBack }: SimpleHeaderProps) => {
  return (
    <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button onClick={onBack} className="p-1 -ml-1 text-neutral-700">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-neutral-900">
        {title}
      </h1>
    </div>
  );
};

export default SimpleHeader;
