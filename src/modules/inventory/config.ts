/**
 * Inventory 模組配置
 *
 * 支援在 AI 後端與主後端之間切換入庫系統
 *
 * @example
 * // .env 設定
 * VITE_INVENTORY_BACKEND=ai    // 使用 AI 後端（預設）
 * VITE_INVENTORY_BACKEND=main  // 使用主後端 Transaction API
 */

export type InventoryBackend = 'ai' | 'main';

/**
 * 取得目前使用的入庫後端類型
 * @returns 'ai' (預設) 或 'main'
 */
export const getInventoryBackend = (): InventoryBackend => {
  const backend = import.meta.env.VITE_INVENTORY_BACKEND as string;
  if (backend === 'main') {
    return 'main';
  }
  return 'ai'; // 預設使用 AI 後端
};

/**
 * 檢查是否使用 AI 後端
 */
export const isAiBackend = (): boolean => getInventoryBackend() === 'ai';

/**
 * 檢查是否使用主後端
 */
export const isMainBackend = (): boolean => getInventoryBackend() === 'main';
