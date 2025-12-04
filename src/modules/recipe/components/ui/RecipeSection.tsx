import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeSectionCard } from './RecipeSectionCard';

type RecipeSectionProps = {
  title: string;
  recipes: RecipeListItem[];
  onRecipeClick: (id: string) => void;
}

export const RecipeSection = ({ title, recipes, onRecipeClick }: RecipeSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (recipes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button 
          onClick={scrollRight}
          className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <ArrowRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide px-4 flex gap-3 pb-2"
      >
        {recipes.map((recipe) => (
          <RecipeSectionCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={onRecipeClick} 
          />
        ))}
      </div>
    </div>
  );
};
