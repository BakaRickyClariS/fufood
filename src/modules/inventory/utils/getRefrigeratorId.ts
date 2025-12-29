/**
 * refrigeratorId 取得工具
 *
 * 提供統一的 refrigeratorId 取得邏輯，支援多來源 fallback：
 * 1. URL 參數 (groupId)
 * 2. Redux store (groups.items[0].id)
 * 3. localStorage 快取 (activeRefrigeratorId)
 * 4. 使用者 ID fallback
 */

const STORAGE_KEY = 'activeRefrigeratorId';

/**
 * 取得 refrigeratorId
 *
 * @param urlGroupId - 從 URL 參數取得的 groupId
 * @param storeGroups - Redux store 中的 groups 陣列
 * @returns refrigeratorId 或 null
 */
export const getRefrigeratorId = (
  urlGroupId?: string,
  storeGroups?: { id: string }[],
): string | null => {
  // 1. URL 參數優先
  if (urlGroupId) {
    saveRefrigeratorId(urlGroupId);
    return urlGroupId;
  }

  // 取得快取
  const cached = getCachedRefrigeratorId();

  // 2. Redux store 驗證與 Fallback
  if (storeGroups && storeGroups.length > 0) {
    // 如果有快取且快取 ID 在列表中，優先使用快取
    if (cached && storeGroups.some((g) => g.id === cached)) {
      return cached;
    }
    
    // 否則使用列表第一個（並更新快取）
    const id = storeGroups[0].id;
    saveRefrigeratorId(id);
    return id;
  }

  // 3. 若無 store 資料但有快取，暫時信任快取
  if (cached) return cached;

  // 4. userId fallback
  const userId = getUserIdFallback();
  if (userId) {
    console.warn('[getRefrigeratorId] Using userId as fallback');
    return userId;
  }

  return null;
};

/**
 * 儲存 refrigeratorId 到 localStorage
 */
export const saveRefrigeratorId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch (e) {
    console.warn('[getRefrigeratorId] Failed to save to localStorage', e);
  }
};

/**
 * 從 localStorage 取得快取的 refrigeratorId
 */
export const getCachedRefrigeratorId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[getRefrigeratorId] Failed to read from localStorage', e);
    return null;
  }
};

/**
 * 清除 localStorage 中的 refrigeratorId 快取
 */
export const clearRefrigeratorIdCache = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[getRefrigeratorId] Failed to clear localStorage', e);
  }
};

/**
 * 從 localStorage 讀取 userId 作為 fallback
 */
const getUserIdFallback = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || null;
    }
  } catch (e) {
    console.warn('[getRefrigeratorId] Failed to parse user', e);
  }
  return null;
};
