import { authApi } from '../api';
import { identity } from '@/shared/utils/identity';
import type { LoginCredentials, RegisterData, User } from '../types';

/**
 * Auth Service - 處理認證相關業務邏輯
 * 
 * 使用統一的 identity 模組管理使用者資料存取。
 * 由於目前使用 HttpOnly Cookie 認證，大部分操作由後端處理。
 * 
 * Mock 功能已移至 mockAuthService.ts
 */
export const authService = {
  /**
   * 儲存使用者資料（使用統一的 identity 模組）
   */
  saveUser: (user: User): void => {
    identity.setUser(user);
  },

  /**
   * 取得儲存的使用者資料
   */
  getUser: (): User | null => {
    return identity.getUser() as User | null;
  },

  /**
   * 清除使用者資料
   */
  clearUser: (): void => {
    identity.clearUser();
  },

  /**
   * 清除所有應用程式快取 (登出時使用)
   */
  clearAllAppData: (): void => {
    // 使用統一的 identity 模組清除所有資料
    identity.clearAll();
    
    // 清除 Mock 資料相關 (如果有的話)
    localStorage.removeItem('mockInventory');
    localStorage.removeItem('mockRecipes');
    localStorage.removeItem('mockGroups');
    
    // 清除所有以 fufood_ 或 mock_ 開頭的 key
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('fufood_') || key.startsWith('mock_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 可選：清除 sessionStorage
    sessionStorage.clear();
    
    console.log('[AuthService] 已清除所有應用程式快取');
  },

  /**
   * 執行登入流程（帳密登入）
   */
  login: async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行註冊流程
   */
  register: async (data: RegisterData) => {
    const response = await authApi.register(data);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行登出流程
   */
  logout: async () => {
    await authApi.logout();
    authService.clearAllAppData();
  },
};

