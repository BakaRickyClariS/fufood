import { useState, useEffect } from 'react';
import type { RecipeListItem, RecipeCategory } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';
import { useSelector } from 'react-redux';
import { selectRecipeLastUpdated } from '@/modules/recipe/store/recipeSlice';

export const useRecipes = (
  category?: RecipeCategory,
  refrigeratorId?: string,
) => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUpdated = useSelector(selectRecipeLastUpdated);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recipeApi.getRecipes({ category, refrigeratorId });
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入食譜失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [category, refrigeratorId, lastUpdated]);

  return { recipes, isLoading, error, refetch: fetchRecipes };
};
