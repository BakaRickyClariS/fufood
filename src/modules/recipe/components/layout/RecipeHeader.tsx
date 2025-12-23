import { ChevronLeft, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorite } from '@/modules/recipe/hooks';

type RecipeHeaderProps = {
  title?: string;
  recipeId?: string;
  isFavorite?: boolean;
};

export const RecipeHeader = ({
  title,
  recipeId,
  isFavorite,
}: RecipeHeaderProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async () => {
    if (recipeId) {
      await toggleFavorite(recipeId, isFavorite);
    }
  };

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
