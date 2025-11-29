import { authApi } from '../api';
import type { LoginCredentials, RegisterData, User, AuthToken } from '../types';

/**
 * Auth Service - 處理認證相關業務邏輯
 */
export const authService = {
  /**
   * 儲存 Token 到 localStorage
   */
  saveToken: (token: AuthToken): void => {
    localStorage.setItem('accessToken', token.accessToken);
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken);
    }
    localStorage.setItem('tokenExpiry', String(Date.now() + token.expiresIn * 1000));
  },

  /**
   * 取得儲存的 Token
   */
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * 清除 Token
   */
  clearToken: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  },

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
