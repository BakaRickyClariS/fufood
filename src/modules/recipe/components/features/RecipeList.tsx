import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/modules/recipe/hooks';
import { CategorySection } from '@/modules/recipe/components/layout/CategorySection';
import { RecipeCardCarousel } from '@/shared/components/recipe';
import type { RecipeCategory, RecipeListItem } from '@/modules/recipe/types';

// 烹飪時間分類
const COOKING_TIME_SECTIONS = [
  { id: 'slow', title: '慢火煮', minTime: 30, maxTime: Infinity },
  { id: 'easy', title: '輕鬆煮', minTime: 15, maxTime: 29 },
  { id: 'quick', title: '快速煮', minTime: 0, maxTime: 14 },
] as const;

export const RecipeList = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | undefined>();
  
  const { recipes, isLoading, error } = useRecipes(selectedCategory);

  // 按烹飪時間分組
  const groupedRecipes = useMemo(() => {
    const groups: Record<string, RecipeListItem[]> = {
      slow: [],
      easy: [],
      quick: [],
      favorites: [],
    };

    recipes.forEach(recipe => {
      // 收藏食譜
      if (recipe.isFavorite) {
        groups.favorites.push(recipe);
      }

      // 按烹飪時間分類
      for (const section of COOKING_TIME_SECTIONS) {
        if (recipe.cookTime >= section.minTime && recipe.cookTime <= section.maxTime) {
          groups[section.id].push(recipe);
          break;
        }
      }
    });

    return groups;
  }, [recipes]);

  const handleRecipeClick = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">載入中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pl-0">
        <CategorySection 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      </div>

      <div className="space-y-6 pb-20">
        {COOKING_TIME_SECTIONS.map(section => (
          <RecipeCardCarousel
            key={section.id}
            title={section.title}
            recipes={groupedRecipes[section.id]}
            onRecipeClick={handleRecipeClick}
          />
        ))}

        {/* 收藏食譜區塊 */}
        <div className="bg-neutral-100 py-4">
          <RecipeCardCarousel
            title="收藏食譜"
            recipes={groupedRecipes.favorites}
            onRecipeClick={handleRecipeClick}
          />
        </div>
      </div>
    </div>
  );
};
