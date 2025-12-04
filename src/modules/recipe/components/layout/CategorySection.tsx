import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { RecipeCategory } from '@/modules/recipe/types';
import { RECIPE_CATEGORIES, CATEGORY_IMAGES } from '@/modules/recipe/constants/categories';

interface CategorySectionProps {
  selectedCategory: RecipeCategory | undefined;
  onSelectCategory: (category: RecipeCategory | undefined) => void;
}

export const CategorySection = ({ selectedCategory, onSelectCategory }: CategorySectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-gray-800">主題探索</h2>
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
        className="overflow-x-auto px-4 flex gap-4 pb-2"
      >
        {RECIPE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(selectedCategory === category ? undefined : category)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div 
              className={`
                w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200
              `}
              style={{
                backgroundColor: selectedCategory === category ? 'var(--color-primary-200)' : 'transparent'
              }}
            >
              <img 
                src={CATEGORY_IMAGES[category]} 
                alt={category} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`
              text-xs font-medium transition-colors
              ${selectedCategory === category ? 'text-primary-600' : 'text-gray-600'}
            `}>
              {category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
