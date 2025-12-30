import { useState, useMemo, useEffect } from 'react';
import { useRecipes } from '@/modules/recipe/hooks';
import {
  CategoryGrid,
  type Category,
} from '@/shared/components/ui/CategoryGrid';
import { RecipeCardCarousel } from '@/shared/components/recipe';
import type { RecipeCategory, RecipeListItem } from '@/modules/recipe/types';
import {
  RECIPE_CATEGORIES,
  CATEGORY_IMAGES,
} from '@/modules/recipe/constants/categories';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';

// 烹飪時間分類
const COOKING_TIME_SECTIONS = [
  { id: 'slow', title: '慢火煮', minTime: 30, maxTime: Infinity },
  { id: 'easy', title: '輕鬆煮', minTime: 15, maxTime: 29 },
  { id: 'quick', title: '快速煮', minTime: 0, maxTime: 14 },
] as const;

// 將 RECIPE_CATEGORIES 轉換為 CategoryGrid 需要的格式
const categoryItems: Category<RecipeCategory>[] = RECIPE_CATEGORIES.map(
  (cat) => ({
    id: cat,
    label: cat,
    icon: CATEGORY_IMAGES[cat],
  }),
);

import { useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';

// ... (imports)

export const RecipeList = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 優先從 location.state 取得完整食譜物件 (AI 生成/通知點擊)
  const openRecipeFromState = (location.state as { openRecipe?: RecipeListItem })?.openRecipe;
  const recipeIdFromUrl = searchParams.get('id') || searchParams.get('recipeId');

  const [selectedCategory, setSelectedCategory] = useState<
    RecipeCategory | undefined
  >();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(
    null,
  );

  const { recipes, isLoading, error } = useRecipes(selectedCategory, activeRefrigeratorId || undefined);

  // Handle recipe selection (from State or URL)
  useEffect(() => {
    // 1. 如果有 State 中的完整食譜 (例如 AI 生成剛剛產生的)，直接使用，不需查列表
    if (openRecipeFromState) {
      setSelectedRecipe(openRecipeFromState);
      setSelectedRecipeId(openRecipeFromState.id);
      return;
    }

    // 2. 如果只有 URL ID，則嘗試從已載入的列表中查找
    if (recipeIdFromUrl && recipes.length > 0) {
      const recipe = recipes.find((r) => r.id === recipeIdFromUrl);
      if (recipe) {
        setSelectedRecipe(recipe);
        setSelectedRecipeId(recipeIdFromUrl);
      } else {
        // 若列表中找不到 (可能是直接貼連結來的，且不在當前分頁/分類中)，
        // 為了讓 Modal 開啟並嘗試自行 fetch，我們先設定 ID
        // RecipeDetailModal 內部會嘗試 fetch (如果沒有傳入 full recipe)
        setSelectedRecipeId(recipeIdFromUrl);
        // selectedRecipe 保持為 null，讓 Modal 處理載入
      }
    }
  }, [recipeIdFromUrl, recipes, openRecipeFromState]);

  // Handle manual recipe click
  const handleRecipeClick = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setSelectedRecipeId(id);
    }
  };

  // 按烹飪時間分組
  const groupedRecipes = useMemo(() => {
    const groups: Record<string, RecipeListItem[]> = {
      slow: [],
      easy: [],
      quick: [],
      favorites: [],
    };

    recipes.forEach((recipe) => {
      // 收藏食譜
      if (recipe.isFavorite) {
        groups.favorites.push(recipe);
      }

      // 按烹飪時間分類
      for (const section of COOKING_TIME_SECTIONS) {
        if (
          recipe.cookTime >= section.minTime &&
          recipe.cookTime <= section.maxTime
        ) {
          groups[section.id].push(recipe);
          break;
        }
      }
    });

    return groups;
  }, [recipes]);

  const handleCloseModal = () => {
    setSelectedRecipeId(null);
    setSelectedRecipe(null);
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">載入中...</div>;
  }

  return (
    <>
      <div className="space-y-6 bg-white pt-7">
        <div className="pl-0">
          <CategoryGrid
            categories={categoryItems}
            selectedId={selectedCategory}
            onCategoryClick={setSelectedCategory}
            title="主題探索"
            showScrollButton
          />
        </div>

        <div className="space-y-6 -mb-13">
          {COOKING_TIME_SECTIONS.map((section) => (
            <RecipeCardCarousel
              key={section.id}
              title={section.title}
              recipes={groupedRecipes[section.id]}
              onRecipeClick={handleRecipeClick}
            />
          ))}

          {/* 收藏食譜區塊 */}
          <div className="bg-neutral-100 py-7">
            <RecipeCardCarousel
              title="收藏食譜"
              recipes={groupedRecipes.favorites}
              onRecipeClick={handleRecipeClick}
            />
          </div>
        </div>
      </div>

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipeId}
        onClose={handleCloseModal}
      />
    </>
  );
};
