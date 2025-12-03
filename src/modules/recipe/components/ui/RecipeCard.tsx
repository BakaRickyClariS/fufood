import type { RecipeListItem } from '@/modules/recipe/types';
import { Clock, Users, Heart } from 'lucide-react';
import { useFavorite } from '@/modules/recipe/hooks';

interface RecipeCardProps {
  recipe: RecipeListItem;
  onClick: (id: string) => void;
}

export const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(recipe.id)}
    >
      <div className="relative aspect-[4/3]">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-2 truncate">{recipe.name}</h3>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{recipe.cookTime}分鐘</span>
          </div>
        </div>
      </div>
    </div>
  );
};
