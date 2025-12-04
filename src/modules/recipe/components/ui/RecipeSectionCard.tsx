import type { RecipeListItem } from '@/modules/recipe/types';
import { Clock, Users, Heart } from 'lucide-react';
import { useFavorite } from '@/modules/recipe/hooks';

interface RecipeSectionCardProps {
  recipe: RecipeListItem;
  onClick: (id: string) => void;
}

export const RecipeSectionCard = ({ recipe, onClick }: RecipeSectionCardProps) => {
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  };

  return (
    <div 
      className="flex-shrink-0 w-40 cursor-pointer group"
      onClick={() => onClick(recipe.id)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* 熱門 tag */}
        <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
          熱門
        </div>
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>
        
        {/* Category badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded">
          {recipe.category}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 text-sm truncate">{recipe.name}</h3>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1 text-primary-500">
            <Clock className="w-3 h-3" />
            <span>{recipe.cookTime}分鐘</span>
          </div>
        </div>
      </div>
    </div>
  );
};
