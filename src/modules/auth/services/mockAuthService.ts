/**
 * Mock Auth Service（開發用）
 *
 * 此檔案包含 Mock 登入相關功能，僅供開發測試使用。
 * 正式環境請使用真實 API 認證。
 *
 * 啟用方式：
 * 1. 在 .env 中設定 VITE_USE_MOCK_API=true
 * 2. 在需要的地方引入此模組
 *
 * @example
 * import { mockAuthService } from '@/modules/auth/services/mockAuthService';
 *
 * // Mock 登入
 * const { user, token } = mockAuthService.mockLogin(avatarId, displayName);
 */

import type { User, AuthToken } from '../types';

const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

/**
 * Mock Auth Service
 * 提供假登入功能，資料儲存在 localStorage
 */
export const mockAuthService = {
  /**
   * 執行假登入流程
   * @param avatarId - 頭像 ID
   * @param displayName - 顯示名稱
   */
  mockLogin: (
    avatarId: number,
    displayName: string,
  ): { user: User; token: AuthToken } => {
    const mockToken: AuthToken = {
      accessToken: `mock_auth_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 3600 * 24 * 7, // 7 天
    };

    const user: User = {
      id: `mock_user_${Date.now()}`,
      email: 'mock@example.com',
      name: displayName,
      displayName: displayName,
      avatar: String(avatarId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 儲存到 localStorage
    mockAuthService.saveToken(mockToken);
    mockAuthService.saveUser(user);

    return { user, token: mockToken };
  },

  /**
   * 儲存 Token 到 localStorage
   */
  saveToken: (token: AuthToken): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token.accessToken);
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken);
    }
    localStorage.setItem(
      'tokenExpiry',
      String(Date.now() + token.expiresIn * 1000),
    );
  },

  /**
   * 儲存使用者資料到 localStorage
   */
  saveUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('userUpdated'));
  },

  /**
   * 取得儲存的使用者資料
   */
  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * 取得儲存的 Token
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * 清除所有認證資料
   */
  clearAll: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem(USER_KEY);
  },

  /**
   * 檢查是否已 Mock 登入
   */
  isAuthenticated: (): boolean => {
    const token = mockAuthService.getToken();
    return token?.startsWith('mock_') ?? false;
  },
};
