/**
 * 身份識別工具模組
 *
 * 統一管理使用者身份相關資訊的存取，包含：
 * - User ID：使用者唯一識別碼
 * - Auth Token：認證令牌（若有）
 * - Refrigerator ID：當前冰箱/群組 ID
 *
 * 此模組作為單一來源 (Single Source of Truth)，
 * 取代分散在各處的 localStorage 存取邏輯。
 *
 * @example
 * import { identity } from '@/shared/utils/identity';
 *
 * // 取得使用者 ID
 * const userId = identity.getUserId();
 *
 * // 取得當前冰箱 ID
 * const refId = identity.getRefrigeratorId();
 *
 * // 儲存使用者資料
 * identity.setUser(userData);
 */

// ============================================================
// 常數定義
// ============================================================

const STORAGE_KEYS = {
  /** 使用者資料物件 */
  USER: 'user',
  /** 認證 token（若使用 localStorage token 模式） */
  AUTH_TOKEN: 'auth_token',
  /** 當前活躍的冰箱/群組 ID */
  REFRIGERATOR_ID: 'activeRefrigeratorId',
} as const;

// ============================================================
// 類型定義
// ============================================================

/** 使用者基本資訊（精簡版，僅供身份識別使用） */
type IdentityUser = {
  id: string;
  name?: string;
  displayName?: string;
  lineId?: string;
  avatar?: string;
  pictureUrl?: string;
};

// ============================================================
// 身份識別工具
// ============================================================

export const identity = {
  // ----------------------------------------------------------
  // User 相關
  // ----------------------------------------------------------

  /**
   * 取得使用者 ID
   * 從多個來源嘗試獲取，優先順序：
   * 1. localStorage 中的 user 物件
   * 2. localStorage 中的 activeRefrigeratorId（暫時 fallback）
   * 3. 無法取得時返回 null
   */
  getUserId: (): string | null => {
    try {
      // 方法 1: 從 user 物件取得
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        const user = JSON.parse(userStr) as IdentityUser;
        if (user.id) {
          return user.id;
        }
      }

      // 方法 2: 使用 activeRefrigeratorId 作為臨時 fallback
      // 這是因為某些情況下登入流程可能沒有正確存儲 user 資料
      const refId = localStorage.getItem(STORAGE_KEYS.REFRIGERATOR_ID);
      if (refId) {
        console.warn(
          '[Identity] 使用 activeRefrigeratorId 作為臨時 userId fallback',
        );
        return refId;
      }
    } catch (e) {
      console.warn('[Identity] Failed to parse user from localStorage', e);
    }
    return null;
  },

  /**
   * 取得完整使用者資料
   */
  getUser: (): IdentityUser | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        return JSON.parse(userStr) as IdentityUser;
      }
    } catch (e) {
      console.warn('[Identity] Failed to parse user from localStorage', e);
    }
    return null;
  },

  /**
   * 儲存使用者資料
   * 同時觸發 userUpdated 事件通知其他元件
   */
  setUser: (user: IdentityUser): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('userUpdated'));
      console.log('[Identity] User saved:', user.id);
    } catch (e) {
      console.error('[Identity] Failed to save user to localStorage', e);
    }
  },

  /**
   * 清除使用者資料
   */
  clearUser: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      console.log('[Identity] User cleared');
    } catch (e) {
      console.error('[Identity] Failed to clear user from localStorage', e);
    }
  },

  /**
   * 檢查是否有有效的使用者身份
   */
  hasUser: (): boolean => {
    return identity.getUserId() !== null;
  },

  // ----------------------------------------------------------
  // Auth Token 相關
  // ----------------------------------------------------------

  /**
   * 取得認證 token
   * 注意：目前後端使用 HttpOnly Cookie，此 token 主要作為備用
   */
  getAuthToken: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.warn('[Identity] Failed to get auth token', e);
      return null;
    }
  },

  /**
   * 儲存認證 token
   */
  setAuthToken: (token: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('[Identity] Failed to save auth token', e);
    }
  },

  /**
   * 清除認證 token
   */
  clearAuthToken: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('[Identity] Failed to clear auth token', e);
    }
  },

  // ----------------------------------------------------------
  // Refrigerator ID 相關
  // ----------------------------------------------------------

  /**
   * 取得當前冰箱/群組 ID
   * 優先順序：
   * 1. 參數傳入的 urlGroupId
   * 2. Redux store 中的 groups（若有傳入）
   * 3. localStorage 快取
   * 4. 使用者 ID 作為 fallback（個人冰箱）
   */
  getRefrigeratorId: (
    urlGroupId?: string,
    storeGroups?: { id: string }[],
  ): string | null => {
    // 1. URL 參數優先
    if (urlGroupId) {
      identity.setRefrigeratorId(urlGroupId);
      return urlGroupId;
    }

    // 2. 從快取取得
    const cached = identity.getCachedRefrigeratorId();

    // 3. Redux store 驗證與 Fallback
    if (storeGroups && storeGroups.length > 0) {
      // 如果有快取且快取 ID 在列表中，優先使用快取
      if (cached && storeGroups.some((g) => g.id === cached)) {
        return cached;
      }

      // 否則使用列表第一個（並更新快取）
      const id = storeGroups[0].id;
      identity.setRefrigeratorId(id);
      return id;
    }

    // 4. 若無 store 資料但有快取，暫時信任快取
    if (cached) return cached;

    // 5. userId fallback（個人冰箱模式）
    const userId = identity.getUserId();
    if (userId) {
      console.warn('[Identity] Using userId as refrigeratorId fallback');
      return userId;
    }

    return null;
  },

  /**
   * 儲存當前冰箱/群組 ID
   */
  setRefrigeratorId: (id: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.REFRIGERATOR_ID, id);
    } catch (e) {
      console.warn('[Identity] Failed to save refrigerator ID', e);
    }
  },

  /**
   * 取得快取的冰箱/群組 ID
   */
  getCachedRefrigeratorId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRIGERATOR_ID);
    } catch (e) {
      console.warn('[Identity] Failed to get cached refrigerator ID', e);
      return null;
    }
  },

  /**
   * 清除冰箱/群組 ID 快取
   */
  clearRefrigeratorId: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.REFRIGERATOR_ID);
    } catch (e) {
      console.warn('[Identity] Failed to clear refrigerator ID', e);
    }
  },

  // ----------------------------------------------------------
  // 全域操作
  // ----------------------------------------------------------

  /**
   * 清除所有身份相關資料（登出時使用）
   */
  clearAll: (): void => {
    identity.clearUser();
    identity.clearAuthToken();
    identity.clearRefrigeratorId();

    // 清除舊版可能遺留的 key
    localStorage.removeItem('cachedUserId');
    localStorage.removeItem('authToken');

    console.log('[Identity] All identity data cleared');
  },

  /**
   * 取得所有身份資訊的摘要（用於 debug）
   */
  getSummary: (): {
    hasUser: boolean;
    userId: string | null;
    hasToken: boolean;
    refrigeratorId: string | null;
  } => {
    return {
      hasUser: identity.hasUser(),
      userId: identity.getUserId(),
      hasToken: !!identity.getAuthToken(),
      refrigeratorId: identity.getCachedRefrigeratorId(),
    };
  },
};

// 匯出 STORAGE_KEYS 供需要直接存取的模組使用
export { STORAGE_KEYS };

// 預設匯出
export default identity;
