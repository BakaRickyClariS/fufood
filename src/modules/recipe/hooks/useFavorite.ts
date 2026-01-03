import { useState } from 'react';
import { toast } from 'sonner';
import { recipeApi } from '@/modules/recipe/services';

export const useFavorite = () => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = async (
    recipeId: string,
    currentFavorite?: boolean,
  ) => {
    // 檢查是否為 Mock 資料
    if (recipeId.startsWith('ai-mock-')) {
      toast.error('範例食譜無法加入收藏，請使用正式生成的食譜');
      return Boolean(currentFavorite);
    }

    setIsToggling(true);
    try {
      const nextFavorite =
        typeof currentFavorite === 'boolean' ? !currentFavorite : undefined;
      const result = await recipeApi.toggleFavorite(recipeId, nextFavorite);
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
