import { useNavigate } from 'react-router-dom';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCard } from './RecipeCard';

type RecipeCardGridProps = {
  title?: string;
  recipes: RecipeListItem[];
  onRecipeClick?: (id: string) => void;
  showMoreLink?: string;
  columns?: 2 | 3 | 4;
  showPopularTag?: boolean | ((index: number) => boolean);
  className?: string;
};

export const RecipeCardGrid = ({ 
  title,
  recipes, 
  onRecipeClick,
  showMoreLink,
  columns = 2,
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

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
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

      {/* 卡片 Grid */}
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={handleRecipeClick}
            showPopularTag={shouldShowPopularTag(index)}
            size="compact"
          />
        ))}
      </div>
    </div>
  );
};
