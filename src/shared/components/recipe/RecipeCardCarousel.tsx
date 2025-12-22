import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCard } from './RecipeCard';

type RecipeCardCarouselProps = {
  title: string;
  recipes: RecipeListItem[];
  onRecipeClick?: (id: string) => void;
  showPopularTag?: boolean;
  showScrollButton?: boolean;
  showMoreLink?: string;
};

export const RecipeCardCarousel = ({
  title,
  recipes,
  onRecipeClick,
  showPopularTag = false,
  showScrollButton = true,
  showMoreLink,
}: RecipeCardCarouselProps) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRecipeClick = (id: string) => {
    if (onRecipeClick) {
      onRecipeClick(id);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (recipes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {showMoreLink && (
          <Link
            to={showMoreLink}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            更多食譜
          </Link>
        )}
        {showScrollButton && !showMoreLink && (
          <button
            onClick={scrollRight}
            className="p-1.5 rounded-full border bg-white border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
            aria-label="向右捲動"
          >
            <ArrowRight className="w-5.5 h-5.5 text-gray-600" />
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto px-4 flex gap-3 pb-2"
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex-shrink-0 w-[200px] cursor-pointer hover:shadow-xl transition-shadow"
          >
            <RecipeCard
              recipe={recipe}
              onClick={handleRecipeClick}
              showPopularTag={showPopularTag}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
