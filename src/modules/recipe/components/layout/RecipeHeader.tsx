import { ChevronLeft, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorite } from '@/modules/recipe/hooks';

type RecipeHeaderProps = {
  title?: string;
  recipeId?: string;
  isFavorite?: boolean;
};

export const RecipeHeader = ({ title, recipeId, isFavorite }: RecipeHeaderProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async () => {
    if (recipeId) {
      await toggleFavorite(recipeId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14">
        <button 
          onClick={() => navigate('/planning?tab=recipes')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        {title && (
          <h1 className="font-bold text-lg text-gray-900 truncate max-w-[60%]">
            {title}
          </h1>
        )}
        
        <div className="flex items-center gap-2">
          {recipeId && (
            <button 
              onClick={handleFavoriteClick}
              disabled={isToggling}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          )}
          <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
            <Share2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
