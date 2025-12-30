/**
 * AI 食譜 Hooks
 *
 * 提供 AI 食譜生成的 React Query hooks
 * 支援 SSE 開關切換
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiRecipeApi } from '../api/aiRecipeApi';
import { useRecipeStream } from './useRecipeStream';
import type { AIRecipeRequest, AIRecipeItem } from '../types';

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
  /** 生成的食譜陣列 */
  recipes: AIRecipeItem[] | null;
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

  // 統一的生成函式
  const generate = async (request: AIRecipeRequest): Promise<void> => {
    if (shouldUseStreaming) {
      await streamHook.startStream(request);
    } else {
      await mutation.mutateAsync(request);
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

  // 標準模式
    // 標準模式下的錯誤處理
    let errorMsg = mutation.error?.message ?? null;
    if (mutation.error) {
       // @ts-ignore - Assuming error object might have code property from backend response
       if (mutation.error?.code === 'AI_007') {
         errorMsg = '輸入內容包含不允許的指令或關鍵字，請重新輸入。';
       }
    }

    return {
      generate,
      isLoading: mutation.isPending,
      text: mutation.data?.data.greeting ?? '',
      progress: mutation.isSuccess ? 100 : 0,
      stage: mutation.isPending ? '生成中...' : mutation.isSuccess ? '完成' : '',
      recipes: mutation.data?.data.recipes ?? null,
      error: errorMsg,
      remainingQueries: mutation.data?.data.remainingQueries ?? null,
      stop,
      reset,
    };
};
