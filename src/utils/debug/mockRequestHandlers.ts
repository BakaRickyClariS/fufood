/**
 * Mock Request Handlers
 * 用於處理 Mock API 的特殊請求，例如強制重置資料或僅使用記憶體模式
 */

export const mockRequestHandlers = {
  /**
   * 檢查是否需要重置所有 Mock 資料
   * 透過網址參數 ?reset_mock=true 觸發
   */
  shouldResetData: (): boolean => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('reset_mock') === 'true';
  },

  /**
   * 檢查是否啟用僅記憶體模式 (不寫入 localStorage)
   * 透過網址參數 ?memory_only=true 觸發
   */
  shouldUseMemoryOnly: (): boolean => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('memory_only') === 'true';
  },

  /**
   * 重置指定的 localStorage Keys
   */
  resetData: (specificKeys?: string[]) => {
    if (specificKeys) {
      specificKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log('[Mock Debug] Resetted specific storage keys:', specificKeys);
    } else {
      // 若無指定 key，則清空所有資料 (包含 user, auth 等)
      // 這是最徹底的重置方式，解決 "重置壞掉" 的問題
      localStorage.clear();
      console.log(
        '[Mock Debug] Resetted ALL storage keys (localStorage.clear())',
      );
    }
  },

  /**
   * 封裝 localStorage 讀取邏輯
   * 若啟用 memory_only，則總是返回 null (模擬無資料，強迫使用預設值)
   * @param key Storage key
   */
  getItem: (key: string): string | null => {
    if (mockRequestHandlers.shouldUseMemoryOnly()) return null;
    return localStorage.getItem(key);
  },

  /**
   * 封裝 localStorage 寫入邏輯
   * 若啟用 memory_only，則不執行寫入
   * @param key Storage key
   * @param value Value string
   */
  setItem: (key: string, value: string): void => {
    if (mockRequestHandlers.shouldUseMemoryOnly()) return;
    localStorage.setItem(key, value);
  },
};
