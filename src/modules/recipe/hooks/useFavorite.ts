import { useState } from 'react';
import { recipeApi } from '@/modules/recipe/services';

export const useFavorite = () => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = async (recipeId: string) => {
    setIsToggling(true);
    try {
      const result = await recipeApi.toggleFavorite(recipeId);
      return result.isFavorite;
    } catch (error) {
      console.error('收藏切換失敗:', error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleFavorite, isToggling };
};
