import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecipeHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-white/30 backdrop-blur-xs">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => navigate('/planning?tab=recipes')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>
    </header>
  );
};
