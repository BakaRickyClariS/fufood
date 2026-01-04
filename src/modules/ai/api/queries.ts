/**
 * AI Query Hooks
 *
 * 提供 AI 模組的 Server State 管理
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiRecipeApi } from './aiRecipeApi';
import { recipeKeys } from '@/modules/recipe/api/queries';
import { inventoryKeys } from '@/modules/inventory/api/queries';
import type { SaveRecipeInput } from '../types';

/**
 * 儲存 AI 生成食譜 Mutation
 */
export const useSaveAIRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveRecipeInput) => aiRecipeApi.saveRecipe(data),
    onSuccess: () => {
      // 1. 刷新食譜列表，確保新食譜出現
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });

      // 2. 雖然 saveRecipe 回傳了 ID，但為確保一致性，我們也讓所有詳細頁資料失效 (若有的話)
      // 注意: variables 中沒有 ID，因為是新增。但如果未來有更新操作，需處理。

      // 3. 刷新庫存摘要 (若 AI 生成會影響庫存顯示? 目前不會，但以防萬一)
      queryClient.invalidateQueries({ queryKey: inventoryKeys.summary() });

      // 4. 觸發重新抓取建議 (可選)
    },
  });
};
