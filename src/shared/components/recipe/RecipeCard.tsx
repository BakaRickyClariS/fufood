import type { RecipeListItem } from '@/modules/recipe/types';
import { Clock, Users, Heart } from 'lucide-react';
import { useFavorite } from '@/modules/recipe/hooks';
import { cn } from '@/shared/utils/styleUtils';

type RecipeCardProps = {
  recipe: RecipeListItem;
  onClick: (id: string) => void;
  showPopularTag?: boolean;
  showCategoryBadge?: boolean;
  className?: string;
};

export const RecipeCard = ({ 
  recipe, 
  onClick, 
  showPopularTag = false,
  showCategoryBadge = true,
  className = ''
}: RecipeCardProps) => {
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "w-[200px] h-[200px] shrink-0",
        className
      )}
      onClick={() => onClick(recipe.id)}
    >
      {/* 背景圖片 */}
      <img 
        src={recipe.imageUrl} 
        alt={recipe.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 熱門標籤 - 左上角 */}
      {showPopularTag && (
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-[#E85A4F] text-white text-[10px] font-medium rounded-lg">
            熱門
          </span>
        </div>
      )}
      
      {/* 愛心按鈕 - 右上角（無背景） */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className="absolute top-3 right-3 transition-transform hover:scale-110"
        aria-label={recipe.isFavorite ? '取消收藏' : '加入收藏'}
      >
        <Heart 
          className={cn(
            "w-6 h-6",
            recipe.isFavorite 
              ? 'fill-white text-white' 
              : 'text-white/90 stroke-2'
          )} 
        />
      </button>
      
      {/* 底部資訊區（黑底模糊背景） */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-black/60 backdrop-blur-md rounded-b-2xl">
        {/* 分類標籤 */}
        {showCategoryBadge && (
          <span className="inline-block px-2 py-0.5 mb-1.5 bg-white/20 text-white text-[10px] font-medium rounded">
            {recipe.category}
          </span>
        )}
        
        {/* 食譜標題 */}
        <h3 className="text-white font-bold mb-1 line-clamp-1 text-sm">
          {recipe.name}
        </h3>
        
        {/* 份量與時間 */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-white" />
            <span className="text-white">{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-primary-500">{recipe.cookTime}分鐘</span>
          </div>
        </div>
      </div>
    </div>
  );
};
