import { authApi } from '../api';
import type { LoginCredentials, RegisterData, User } from '../types';

/**
 * Auth Service - 處理認證相關業務邏輯
 * 
 * 注意：此 Service 主要用於輔助真實 API 流程。
 * 由於目前使用 HttpOnly Cookie 認證，大部分操作由後端處理。
 * 
 * Mock 功能已移至 mockAuthService.ts
 */
export const authService = {
  /**
   * 儲存使用者資料到 localStorage（作為備份快取）
   */
  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
    // 觸發自訂事件通知同視窗中的其他元件
    window.dispatchEvent(new CustomEvent('userUpdated'));
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
   * 清除所有應用程式快取 (登出時使用)
   */
  clearAllAppData: (): void => {
    // 使用者資料
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // 冰箱/群組相關
    localStorage.removeItem('activeRefrigeratorId');
    
    // Mock 資料相關 (如果有的話)
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
