/**
 * AI 食譜 Hooks
 *
 * 提供 AI 食譜生成的 React Query hooks
 * 支援 SSE 開關切換
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from '@/store/slices/activeGroupSlice';
import { aiRecipeApi } from '../api/aiRecipeApi';
import { useRecipeStream } from './useRecipeStream';
import { useSaveAIRecipeMutation } from '../api/queries';
import {
  transformAIRecipesToDisplayModels,
  type DisplayRecipe,
} from '../utils/recipeTransformer';
import type { AIRecipeRequest, AIRecipeItem } from '../types';
import { validateRecipes } from '../utils/responseValidator';

// ============================================================
// Query Keys
// ============================================================

export const aiQueryKeys = {
  suggestions: ['ai', 'recipe', 'suggestions'] as const,
  recipes: ['ai', 'recipes'] as const,
};

// ============================================================
// Hooks
// ============================================================

/**
 * 取得 Prompt 建議
 *
 * @example
 * ```tsx
 * const { data } = useRecipeSuggestions();
 * const suggestions = data?.data ?? [];
 * ```
 */
export const useRecipeSuggestions = () => {
  return useQuery({
    queryKey: aiQueryKeys.suggestions,
    queryFn: () => aiRecipeApi.getSuggestions(),
    staleTime: 1000 * 60 * 60, // 1 小時快取
    retry: 1,
  });
};

/**
 * 生成食譜 Mutation（標準 API，非 SSE）
 */
export const useGenerateRecipeMutation = () => {
  return useMutation({
    mutationFn: aiRecipeApi.generateRecipe,
  });
};

// ============================================================
// 統一的 AI 食譜生成 Hook（支援 SSE 開關）
// ============================================================

export type UseAIRecipeGenerateOptions = {
  /** 是否使用 SSE Streaming（預設 true） */
  useStreaming?: boolean;
};

export type AIRecipeGenerateResult = {
  /** 生成食譜（呼叫此函式開始生成） */
  generate: (request: AIRecipeRequest) => Promise<void>;
  /** 是否正在載入/串流 */
  isLoading: boolean;
  /** AI 回覆文字（SSE 模式逐字累積，標準模式為 greeting） */
  text: string;
  /** 進度百分比 (0-100) */
  progress: number;
  /** 目前階段描述 */
  stage: string;
  /** 生成的食譜陣列（已轉換為前端顯示格式） */
  recipes: DisplayRecipe[] | null;
  /** 錯誤訊息 */
  error: string | null;
  /** 剩餘查詢次數 */
  remainingQueries: number | null;
  /** 停止串流（僅 SSE 模式有效） */
  stop: () => void;
  /** 重置狀態 */
  reset: () => void;
};

/**
 * AI 食譜生成 Hook
 *
 * 支援 SSE Streaming 和標準 API 兩種模式
 *
 * @example
 * ```tsx
 * // SSE 模式（預設）
 * const { generate, text, recipes, isLoading } = useAIRecipeGenerate();
 *
 * // 標準模式
 * const { generate, recipes, isLoading } = useAIRecipeGenerate({ useStreaming: false });
 *
 * await generate({ prompt: '晚餐想吃日式' });
 * ```
 */
export const useAIRecipeGenerate = (
  options: UseAIRecipeGenerateOptions = {},
): AIRecipeGenerateResult => {
  const { useStreaming = true } = options;

  // Mock 模式下強制使用標準 API（非 SSE）
  const isMock = aiRecipeApi.isMockMode();
  const shouldUseStreaming = useStreaming && !isMock;

  // SSE 模式
  const streamHook = useRecipeStream();

  // 標準模式
  const mutation = useGenerateRecipeMutation();
  const { mutateAsync: saveRecipe } = useSaveAIRecipeMutation();

  const activeGroupId = useSelector(selectActiveGroupId);

  const [manualRecipes, setManualRecipes] = useState<DisplayRecipe[] | null>(
    null,
  );

  // 統一的生成函式
  const generate = async (request: AIRecipeRequest): Promise<void> => {
    // 重置之前的結果
    setManualRecipes(null);

    if (shouldUseStreaming) {
      await streamHook.startStream(request);
    } else {
      const response = await mutation.mutateAsync(request);

      // aiApi 已 auto-unwrap v2 response，response 直接是 { greeting, recipes, ... }
      // 需同時相容 mock 資料（有 isMock 欄位，recipes 已在頂層）
      const recipes: AIRecipeItem[] =
        (response as any).recipes ?? (response as any).data?.recipes ?? [];

      // 如果是真實 API 回傳且有食譜，執行自動儲存
      if (!response.isMock && recipes.length > 0) {
        try {
          // 1. 驗證並清理資料 (確保結構正確且安全)
          const validatedRecipes = validateRecipes(recipes);

          const savedResults = await Promise.all(
            validatedRecipes.map((r) =>
              saveRecipe({
                name: r.name,
                category: r.category,
                imageUrl: r.imageUrl,
                servings: r.servings,
                cookTime: r.cookTime,
                difficulty: r.difficulty,
                ingredients: (r.ingredients || []).map((i) => ({
                  name: i.name,
                  quantity: String(i.amount), // 已由 validator 處理為字串或 '適量'
                  unit: i.unit || '',
                })),
                seasonings: (r.seasonings || []).map((s) => ({
                  name: s.name,
                  quantity: String(s.amount), // 已由 validator 處理為字串或 '適量'
                  unit: s.unit || '',
                })),
                steps: (r.steps || []).map((s) => ({
                  step: s.step,
                  description: s.description,
                })),
                originalPrompt: request.prompt,
                groupId: activeGroupId || undefined,
              }),
            ),
          );

          // 通知由後端在 API 完成時自動觸發，前端不再手動發送

          // 使用後端回傳的真實 ID 轉換資料
          const savedIds = savedResults.map((s) => s?.id);
          const transformedRecipes = transformAIRecipesToDisplayModels(
            recipes,
            savedIds,
          );

          setManualRecipes(transformedRecipes);
        } catch (err) {
          console.error('Auto-save failed in normal mode:', err);
          // 儲存失敗仍顯示原始結果（也需轉換以正確顯示）
          setManualRecipes(transformAIRecipesToDisplayModels(recipes));
        }
      } else {
        // Mock 資料或無結果
        setManualRecipes(transformAIRecipesToDisplayModels(recipes));
      }
    }
  };

  // 停止函式
  const stop = () => {
    if (shouldUseStreaming) {
      streamHook.stopStream();
    }
  };

  // 重置函式
  const reset = () => {
    setManualRecipes(null);
    if (shouldUseStreaming) {
      streamHook.reset();
    } else {
      mutation.reset();
    }
  };

  // 根據模式返回對應狀態
  if (shouldUseStreaming) {
    return {
      generate,
      isLoading: streamHook.isStreaming,
      text: streamHook.text,
      progress: streamHook.progress,
      stage: streamHook.stage,
      recipes: streamHook.recipes,
      error: streamHook.error,
      remainingQueries: streamHook.remainingQueries,
      stop,
      reset,
    };
  }

  // 標準模式下的錯誤處理
  let errorMsg = mutation.error?.message ?? null;
  if (mutation.error) {
    console.error('[AI useAIRecipeGenerate] Mutation error:', mutation.error);
    // @ts-ignore
    if (mutation.error?.code === 'AI_007') {
      errorMsg = '輸入內容包含不允許的指令或關鍵字，請重新輸入。';
    }
  }

  // 計算 recipes（確保型別一致）
  // aiApi auto-unwrap 後 mutation.data 直接是 { greeting, recipes, ... }
  const getRecipes = (): DisplayRecipe[] | null => {
    if (manualRecipes) return manualRecipes;
    const rawData = mutation.data as any;
    const recipeList = rawData?.recipes ?? rawData?.data?.recipes;
    if (recipeList) {
      return transformAIRecipesToDisplayModels(recipeList);
    }
    return null;
  };

  const rawMutationData = mutation.data as any;

  return {
    generate,
    isLoading: mutation.isPending,
    text: rawMutationData?.greeting ?? rawMutationData?.data?.greeting ?? '',
    progress: mutation.isSuccess ? 100 : 0,
    stage: mutation.isPending ? '生成中...' : mutation.isSuccess ? '完成' : '',
    recipes: getRecipes(),
    error: errorMsg,
    remainingQueries:
      rawMutationData?.remainingQueries ??
      rawMutationData?.data?.remainingQueries ??
      null,
    stop,
    reset,
  };
};
