import { authApi } from '../api';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '../utils/authUtils';
import type { LoginCredentials, RegisterData, User, AuthToken } from '../types';

/**
 * Auth Service - 處理認證相關業務邏輯
 */
export const authService = {
  /**
   * 儲存 Token 到 localStorage
   * 使用 authUtils 統一管理 accessToken
   */
  saveToken: (token: AuthToken): void => {
    // 使用 authUtils 儲存主要的 accessToken
    setAuthToken(token.accessToken);

    // refreshToken 和 expiry 另外儲存
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken);
    }
    localStorage.setItem(
      'tokenExpiry',
      String(Date.now() + token.expiresIn * 1000),
    );
  },

  /**
   * 取得儲存的 Token
   * 使用 authUtils 讀取
   */
  getToken: (): string | null => getAuthToken(),

  /**
   * 清除 Token
   * 使用 authUtils 清除 accessToken
   */
  clearToken: (): void => {
    removeAuthToken();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  },

  /**
   * 取得 Refresh Token
   */
  getRefreshToken: (): string | null => localStorage.getItem('refreshToken'),

  /**
   * 檢查 Token 是否過期
   */
  isTokenExpired: (): boolean => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return Date.now() > Number(expiry);
  },

  /**
   * 儲存使用者資料
   */
  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * 取得儲存的使用者資料
   */
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 清除使用者資料
   */
  clearUser: (): void => {
    localStorage.removeItem('user');
  },

  /**
   * 執行登入流程
   */
  login: async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    authService.saveToken(response.token);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行註冊流程
   */
  register: async (data: RegisterData) => {
    const response = await authApi.register(data);
    authService.saveToken(response.token);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行登出流程
   */
  logout: async () => {
    await authApi.logout();
    authService.clearToken();
    authService.clearUser();
  },
};
