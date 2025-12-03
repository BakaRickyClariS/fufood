import type { RecipeCategory } from '@/modules/recipe/types';

interface CategorySectionProps {
  selectedCategory: RecipeCategory | undefined;
  onSelectCategory: (category: RecipeCategory | undefined) => void;
}

import { RECIPE_CATEGORIES } from '@/modules/recipe/constants/categories';

export const CategorySection = ({ selectedCategory, onSelectCategory }: CategorySectionProps) => {
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-3">
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${!selectedCategory 
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          全部
        </button>
        
        {RECIPE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === category 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
