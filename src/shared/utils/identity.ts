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
 * const refId = identity.getGroupId();
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
  /** JWT 認證令牌 */
  AUTH_TOKEN: 'auth_token',
  /** 當前活躍的群組 ID */
  GROUP_ID: 'activeGroupId',
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
   * 取得使用者 ID (用於 X-User-Id Header)
   *
   * 重要：此處的 "User ID" 實際上是 **群組 ID** (activeGroupId)
   * 這是因為 AI Backend 使用 X-User-Id 來識別當前操作的冰箱/群組
   *
   * @returns activeGroupId (群組 ID)
   */
  getUserId: (): string | null => {
    try {
      const groupId = localStorage.getItem(STORAGE_KEYS.GROUP_ID);
      if (groupId) {
        return groupId;
      }

      // Fallback: 如果沒有 activeGroupId，嘗試使用 User ID
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          return user.id;
        }
      }
    } catch (e) {
      console.warn('[Identity] Failed to get activeGroupId', e);
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

  /**
   * 檢查是否可以發送需要認證的 API 請求
   *
   * 策略：
   * 1. 若已標記為登出 (logged_out = 'true')，不允許
   * 2. 若有使用者快取或冰箱 ID，允許
   * 3. 完全無登入痕跡，不允許（避免在登入頁面產生 401 錯誤）
   *
   * @returns 是否可以發送認證請求
   */
  canMakeAuthenticatedRequest: (): boolean => {
    try {
      const loggedOut = sessionStorage.getItem('logged_out');
      if (loggedOut === 'true') return false;

      const hasUserCache = localStorage.getItem(STORAGE_KEYS.USER) !== null;
      const hasGroupId = localStorage.getItem(STORAGE_KEYS.GROUP_ID) !== null;

      return hasUserCache || hasGroupId;
    } catch (e) {
      console.warn('[Identity] Failed to check auth state', e);
      return false;
    }
  },

  /**
   * 登入成功時呼叫，清除登出標記
   * 應該在登入回調成功後呼叫
   */
  onLoginSuccess: (): void => {
    try {
      sessionStorage.removeItem('logged_out');
      console.log('[Identity] Login success - cleared logged_out flag');
    } catch (e) {
      console.warn('[Identity] Failed to clear logged_out flag', e);
    }
  },

  /**
   * 登出時呼叫，設定登出標記
   * 應該在登出操作時呼叫
   */
  onLogout: (): void => {
    try {
      sessionStorage.setItem('logged_out', 'true');
      console.log('[Identity] Logout - set logged_out flag');
    } catch (e) {
      console.warn('[Identity] Failed to set logged_out flag', e);
    }
  },

  // ----------------------------------------------------------
  // Auth Token 相關
  // ----------------------------------------------------------

  /**
   * 取得認證令牌
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
   * 儲存認證令牌
   */
  setAuthToken: (token: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('[Identity] Failed to save auth token', e);
    }
  },

  /**
   * 清除認證令牌
   */
  clearAuthToken: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('[Identity] Failed to clear auth token', e);
    }
  },

  // ----------------------------------------------------------
  // Group ID 相關
  // ----------------------------------------------------------

  /**
   * 取得當前冰箱/群組 ID
   * 優先順序：
   * 1. 參數傳入的 urlGroupId
   * 2. Redux store 中的 groups（若有傳入）
   * 3. localStorage 快取
   * 4. 使用者 ID 作為 fallback（個人冰箱）
   */
  getGroupId: (
    urlGroupId?: string,
    storeGroups?: { id: string }[],
  ): string | null => {
    // 1. URL 參數優先
    if (urlGroupId) {
      identity.setGroupId(urlGroupId);
      return urlGroupId;
    }

    // 2. 從快取取得
    const cached = identity.getCachedGroupId();

    // 3. Redux store 驗證與 Fallback
    if (storeGroups && storeGroups.length > 0) {
      // 如果有快取且快取 ID 在列表中，優先使用快取
      if (cached && storeGroups.some((g) => g.id === cached)) {
        return cached;
      }

      // 否則使用列表第一個（並更新快取）
      const id = storeGroups[0].id;
      identity.setGroupId(id);
      return id;
    }

    // 4. 若無 store 資料但有快取，暫時信任快取
    if (cached) return cached;

    // 5. userId fallback（已移除）
    // const userId = identity.getUserId();
    // if (userId) {
    //   console.warn('[Identity] Using userId as groupId fallback');
    //   return userId;
    // }

    return null;
  },

  /**
   * 儲存當前群組 ID
   */
  setGroupId: (id: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUP_ID, id);
    } catch (e) {
      console.warn('[Identity] Failed to save group ID', e);
    }
  },

  /**
   * 取得快取的群組 ID
   */
  getCachedGroupId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.GROUP_ID);
    } catch (e) {
      console.warn('[Identity] Failed to get cached group ID', e);
      return null;
    }
  },

  /**
   * 清除群組 ID 快取
   */
  clearGroupId: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.GROUP_ID);
    } catch (e) {
      console.warn('[Identity] Failed to clear group ID', e);
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
    identity.clearGroupId();

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
    groupId: string | null;
  } => {
    return {
      hasUser: identity.hasUser(),
      userId: identity.getUserId(),
      hasToken: !!identity.getAuthToken(),
      groupId: identity.getCachedGroupId(),
    };
  },
};

// 匯出 STORAGE_KEYS 供需要直接存取的模組使用
export { STORAGE_KEYS };

// 預設匯出
export default identity;
