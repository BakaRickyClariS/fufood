import { useNavigate } from 'react-router-dom';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCard } from './RecipeCard';

type RecipeCardGridProps = {
  title?: string;
  recipes: RecipeListItem[];
  onRecipeClick?: (id: string) => void;
  showMoreLink?: string;
  showPopularTag?: boolean | ((index: number) => boolean);
  className?: string;
};

export const RecipeCardGrid = ({ 
  title,
  recipes, 
  onRecipeClick,
  showMoreLink,
  showPopularTag = false,
  className = ''
}: RecipeCardGridProps) => {
  const navigate = useNavigate();

  const handleRecipeClick = (id: string) => {
    if (onRecipeClick) {
      onRecipeClick(id);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  const handleShowMore = () => {
    if (showMoreLink) {
      navigate(showMoreLink);
    }
  };

  // 判斷是否顯示熱門標籤
  const shouldShowPopularTag = (index: number): boolean => {
    if (typeof showPopularTag === 'function') {
      return showPopularTag(index);
    }
    return showPopularTag;
  };



  if (recipes.length === 0) return null;

  return (
    <div className={className}>
      {/* 標題列 */}
      {(title || showMoreLink) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2 className="text-neutral-900 font-bold text-lg">{title}</h2>
          )}
          {showMoreLink && (
            <button 
              type="button" 
              onClick={handleShowMore}
              className="text-neutral-700 text-sm"
            >
              查看更多
            </button>
          )}
        </div>
      )}

      {/* 卡片 Flex 排列 */}
      <div className="flex flex-row gap-4">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={handleRecipeClick}
            showPopularTag={shouldShowPopularTag(index)}
          />
        ))}
      </div>
    </div>
  );
};
