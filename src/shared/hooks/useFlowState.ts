import { useState, useCallback } from 'react';

/**
 * 流程狀態持久化 Hook
 *
 * 用於 GSAP timeline Modal 的狀態持久化，避免重新整理時丟失流程狀態。
 * 使用 sessionStorage 存儲，關閉分頁自動清除。
 *
 * @example
 * const { saveState, clearState, restoreState, skipAnimation, setSkipAnimation } = useFlowState({
 *   key: 'consumption',
 *   contextId: itemId,
 * });
 */

type FlowStateOptions = {
  /** sessionStorage key 識別碼 */
  key: string;
  /** 過期時間（毫秒），預設 5 分鐘 */
  expiryMs?: number;
  /** 關聯 ID，用於驗證恢復的狀態是否屬於同一 context */
  contextId?: string;
};

type StoredFlowState<T> = {
  step: string;
  data: T;
  contextId?: string;
  timestamp: number;
};

export const useFlowState = <T extends Record<string, unknown>>(
  options: FlowStateOptions,
) => {
  const { key, expiryMs = 5 * 60 * 1000, contextId } = options;
  const storageKey = `fufood_flow_${key}`;

  // 控制是否跳過入場動畫（恢復狀態時使用）
  const [skipAnimation, setSkipAnimation] = useState(false);

  /**
   * 儲存流程狀態
   */
  const saveState = useCallback(
    (step: string, data: T) => {
      const state: StoredFlowState<T> = {
        step,
        data,
        contextId,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn('[useFlowState] 儲存狀態失敗:', error);
      }
    },
    [storageKey, contextId],
  );

  /**
   * 讀取流程狀態（內部使用）
   */
  const loadState = useCallback((): StoredFlowState<T> | null => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;

      const state = JSON.parse(raw) as StoredFlowState<T>;

      // 檢查是否過期
      if (Date.now() - state.timestamp > expiryMs) {
        sessionStorage.removeItem(storageKey);
        return null;
      }

      // 檢查 contextId 是否匹配（如果有指定）
      if (contextId && state.contextId !== contextId) {
        return null;
      }

      return state;
    } catch {
      return null;
    }
  }, [storageKey, expiryMs, contextId]);

  /**
   * 清除流程狀態（流程結束時呼叫）
   */
  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('[useFlowState] 清除狀態失敗:', error);
    }
  }, [storageKey]);

  /**
   * 嘗試恢復狀態
   * @param onRestore 恢復成功時的回呼，接收 step 和 data
   * @returns 是否成功恢復
   */
  const restoreState = useCallback(
    (onRestore: (step: string, data: T) => void): boolean => {
      const state = loadState();
      if (state) {
        setSkipAnimation(true);
        onRestore(state.step, state.data);
        return true;
      }
      return false;
    },
    [loadState],
  );

  /**
   * 檢查是否有已儲存的狀態
   */
  const hasState = useCallback((): boolean => {
    return loadState() !== null;
  }, [loadState]);

  return {
    saveState,
    loadState,
    clearState,
    restoreState,
    hasState,
    skipAnimation,
    setSkipAnimation,
  };
};

export default useFlowState;
