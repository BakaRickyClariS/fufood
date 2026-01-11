/**
 * SSE Streaming Hook
 *
 * 用於 AI 食譜生成的即時串流顯示
 */
import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { aiRecipeApi } from '../api/aiRecipeApi';
import { validateRecipes, validateGreeting } from '../utils/responseValidator';
import {
  transformAIRecipesToDisplayModels,
  type DisplayRecipe,
} from '../utils/recipeTransformer';
import { useSaveAIRecipeMutation } from '../api/queries';
import { useSendNotificationMutation } from '@/modules/notifications/api/queries';
import { useNotificationMetadata } from '@/modules/notifications/hooks/useNotificationMetadata';
import type { AIRecipeRequest, AIStreamEvent } from '../types';

export type StreamState = {
  /** 是否正在串流 */
  isStreaming: boolean;
  /** 串流文字（逐字累積） */
  text: string;
  /** 進度百分比 (0-100) */
  progress: number;
  /** 目前階段描述 */
  stage: string;
  /** 完成後的食譜陣列（已轉換為前端顯示格式） */
  recipes: DisplayRecipe[] | null;
  /** 錯誤訊息 */
  error: string | null;
  /** 剩餘查詢次數 */
  remainingQueries: number | null;
};

const initialState: StreamState = {
  isStreaming: false,
  text: '',
  progress: 0,
  stage: '',
  recipes: null,
  error: null,
  remainingQueries: null,
};

/**
 * SSE Streaming Hook
 *
 * @example
 * ```tsx
 * const { text, progress, recipes, isStreaming, startStream, stopStream } = useRecipeStream();
 *
 * const handleSubmit = async () => {
 *   await startStream({ prompt: '晚餐想吃日式' });
 * };
 * ```
 */
export const useRecipeStream = () => {
  const [state, setState] = useState<StreamState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentPromptRef = useRef<string>('');

  // 從 Redux 取得當前冰箱 ID（根據 Code Review 建議，統一來源）
  const refrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 取得群組名稱和操作者資訊
  const { groupName, actorName, actorId } = useNotificationMetadata(
    refrigeratorId || undefined,
  );

  // Mutations
  const { mutateAsync: saveRecipe } = useSaveAIRecipeMutation();
  const { mutateAsync: sendNotification } = useSendNotificationMutation();

  /**
   * 解析 SSE 事件並更新狀態
   */
  const handleEvent = useCallback(
    async (event: AIStreamEvent) => {
      switch (event.event) {
        case 'start':
          setState((s) => ({
            ...s,
            isStreaming: true,
            text: '',
            progress: 0,
            stage: '開始生成...',
            error: null,
          }));
          break;

        case 'chunk': {
          // 驗證 greeting 內容
          const safeText =
            event.data.section === 'greeting'
              ? validateGreeting(event.data.text)
              : event.data.text;
          setState((s) => ({
            ...s,
            text: s.text + safeText,
          }));
          break;
        }

        case 'progress':
          setState((s) => ({
            ...s,
            progress: event.data.percent,
            stage: event.data.stage,
          }));
          break;

        case 'done': {
          // 驗證 AI 回應結構
          const validatedRecipes = validateRecipes(event.data.recipes || []);

          if (validatedRecipes.length === 0 && event.data.recipes?.length > 0) {
            console.warn(
              '[AI Security] All recipes filtered due to invalid structure',
            );
          } else if (
            validatedRecipes.length < (event.data.recipes?.length || 0)
          ) {
            console.warn(
              `[AI Security] Some recipes filtered: ${event.data.recipes?.length} -> ${validatedRecipes.length}`,
            );
          }

          // 使用集中式轉換工具函式
          let finalRecipes =
            transformAIRecipesToDisplayModels(validatedRecipes);

          // 自動儲存食譜到後端
          if (validatedRecipes && validatedRecipes.length > 0) {
            try {
              const savedRecipes = await Promise.all(
                validatedRecipes.map(async (recipe) => {
                  return saveRecipe({
                    name: recipe.name,
                    category: recipe.category,
                    imageUrl: recipe.imageUrl,
                    servings: recipe.servings,
                    cookTime: recipe.cookTime,
                    difficulty: recipe.difficulty,
                    ingredients: (recipe.ingredients || []).map((i) => ({
                      name: i.name,
                      quantity: String(i.amount),
                      unit: i.unit || '',
                    })),
                    seasonings: (recipe.seasonings || []).map((s) => ({
                      name: s.name,
                      quantity: String(s.amount),
                      unit: s.unit || '',
                    })),
                    steps: (recipe.steps || []).map((s) => ({
                      step: s.step,
                      description: s.description,
                    })),
                    originalPrompt: currentPromptRef.current,
                    refrigeratorId: refrigeratorId || undefined,
                  });
                }),
              );

              // 使用後端回傳的真實 ID 重新轉換
              const savedIds = savedRecipes.map((s) => s?.id);
              finalRecipes = transformAIRecipesToDisplayModels(
                validatedRecipes,
                savedIds,
              );

              // 發送 AI 食譜生成通知
              if (refrigeratorId && finalRecipes.length > 0) {
                const firstRecipeName = finalRecipes[0].name;
                const msg =
                  finalRecipes.length > 1
                    ? `已為您生成 ${firstRecipeName} 等 ${finalRecipes.length} 道新食譜！`
                    : `已為您生成新食譜：${firstRecipeName}`;

                await sendNotification({
                  groupId: refrigeratorId,
                  title: 'AI 食譜生成完成',
                  body: msg,
                  type: 'recipe',
                  subType: 'generate',
                  group_name: groupName,
                  actor_name: actorName,
                  actor_id: actorId,
                  action: {
                    type: 'recipe',
                    payload: { recipeId: finalRecipes[0].id },
                  },
                });
              }
            } catch (err) {
              console.error('Auto-save recipes failed:', err);
              // 動態引入 toast 以避免頂層循環依賴或 SSR 問題
              import('sonner').then(({ toast }) => {
                toast.error('食譜自動儲存失敗，請稍後再試');
              });
            }
          }

          setState((s) => ({
            ...s,
            isStreaming: false,
            progress: 100,
            stage: '完成',
            recipes: finalRecipes,
            remainingQueries: event.data.remainingQueries,
          }));
          break;
        }

        case 'error': {
          // AI 錯誤碼友善訊息映射
          const errorMessages: Record<string, string> = {
            AI_001: '請輸入您想要的食譜說明',
            AI_002: '輸入內容過長，請精簡您的描述',
            AI_003: '已達每日查詢上限，請明天再試',
            AI_004: '請先登入以使用 AI 功能',
            AI_005: 'AI 服務暫時無法使用，請稍後再試',
            AI_006: 'AI 生成逾時，請重試',
            AI_007: '輸入內容包含不允許的指令或關鍵字，請重新輸入',
          };
          const friendlyMessage =
            errorMessages[event.data.code] || event.data.message;
          setState((s) => ({
            ...s,
            isStreaming: false,
            error: friendlyMessage,
          }));
          break;
        }
      }
    },
    [
      refrigeratorId,
      groupName,
      actorName,
      actorId,
      saveRecipe,
      sendNotification,
    ],
  );

  /**
   * 開始 SSE 串流
   */
  const startStream = useCallback(
    async (request: AIRecipeRequest) => {
      // 儲存 Prompt
      currentPromptRef.current = request.prompt;

      // 中止之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 建立新的 AbortController
      abortControllerRef.current = new AbortController();

      // 重置狀態
      setState({
        ...initialState,
        isStreaming: true,
        stage: '連線中...',
      });

      try {
        const response = await fetch(aiRecipeApi.getStreamUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(request),
          credentials: 'include',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('無法取得串流');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留不完整的最後一行

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                handleEvent(data);
              } catch {
                // 忽略解析錯誤
              }
            }
          }
        }

        // 處理最後的 buffer
        if (buffer.startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.slice(6));
            handleEvent(data);
          } catch {
            // 忽略解析錯誤
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 請求被中止，不處理
          return;
        }

        setState((s) => ({
          ...s,
          isStreaming: false,
          error: error instanceof Error ? error.message : '發生未知錯誤',
        }));
      }
    },
    [handleEvent],
  );

  /**
   * 停止串流
   */
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  /**
   * 重置狀態
   */
  const reset = useCallback(() => {
    stopStream();
    setState(initialState);
  }, [stopStream]);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
};
