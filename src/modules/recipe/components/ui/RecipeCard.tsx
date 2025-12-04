import type { RecipeListItem } from '@/modules/recipe/types';
import { Clock, Users, Heart } from 'lucide-react';
import { useFavorite } from '@/modules/recipe/hooks';

type RecipeCardProps = {
  recipe: RecipeListItem;
  onClick: (id: string) => void;
  showPopularTag?: boolean; // 是否顯示「熱門」標籤
}

export const RecipeCard = ({ recipe, onClick, showPopularTag = false }: RecipeCardProps) => {
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  };

  return (
    <div 
      className="relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow aspect-square"
      onClick={() => onClick(recipe.id)}
    >
      {/* 背景圖片 */}
      <img 
        src={recipe.imageUrl} 
        alt={recipe.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 底部漸層遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* 左上角「熱門」標籤 */}
      {showPopularTag && (
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-[#E85A4F] text-white text-sm font-medium rounded-lg">
            熱門
          </span>
        </div>
      )}
      
      {/* 右上角愛心按鈕 */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110"
        aria-label={recipe.isFavorite ? '取消收藏' : '加入收藏'}
      >
        <Heart 
          className={`w-7 h-7 ${
            recipe.isFavorite 
              ? 'fill-white text-white' 
              : 'text-white/90 stroke-2'
          }`} 
        />
      </button>
      
      {/* 底部資訊區 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* 分類標籤 */}
        <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded mb-2">
          {recipe.category}
        </span>
        
        {/* 食譜標題 */}
        <h3 className="text-white text-xl font-bold mb-2 drop-shadow-md">
          {recipe.name}
        </h3>
        
        {/* 份量與時間 */}
        <div className="flex items-center gap-4 text-white/90 text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookTime}分鐘</span>
          </div>
        </div>
      </div>
    </div>
  );
};
