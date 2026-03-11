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
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // 可選：清除 sessionStorage
    sessionStorage.clear();

    console.log('[AuthService] 已清除所有應用程式快取');
  },

  /**
   * 執行登入流程（帳密登入）
   */
  login: async (credentials: LoginCredentials) => {
    // 確保登入時清除可能殘留的前一位使用者的冰箱 ID
    identity.clearGroupId();
    const response = await authApi.login(credentials);

    // 登入成功後，立即獲取完整的使用者個人資料並儲存
    // 這確保了 localStorage 中包含完整的 User ID 和其他資訊
    try {
      const profile: any = await authApi.getProfile();
      // 將 ProfileData 轉換為 User 格式 (或直接儲存 profileData)
      const profileData = profile?.data ?? profile;

      if (profileData && profileData.id) {
        // 合併 login response 雖然可能已經包含部分資訊，但 getProfile 更完整
        const fullUser = {
          ...response.user,
          ...profileData,
          name: profileData.name || response.user?.name || 'Guest',
          avatar:
            profileData.avatar ||
            profileData.picture_url ||
            profileData.picture ||
            profileData.profilePictureUrl ||
            response.user?.avatar ||
            '',
          // 修正類型不匹配：將 null 轉換為 undefined
          email: profileData.email || undefined,
          // 若有其他可能為 null 的欄位也需處理
          profilePictureUrl: profileData.profilePictureUrl || undefined,
          // 轉換日期字串為 Date 物件
          createdAt:
            typeof profileData.createdAt === 'string'
              ? new Date(profileData.createdAt)
              : profileData.createdAt,
          updatedAt:
            typeof profileData.updatedAt === 'string'
              ? new Date(profileData.updatedAt)
              : profileData.updatedAt,
        };
        authService.saveUser(fullUser);
      } else {
        authService.saveUser(response.user);
      }
    } catch (profileError) {
      console.warn(
        '[AuthService] Failed to fetch full profile after login:',
        profileError,
      );
      // Fallback to basic user info from login response
      authService.saveUser(response.user);
    }

    return response;
  },

  /**
   * 執行註冊流程
   */
  register: async (data: RegisterData) => {
    // 確保註冊時清除可能殘留的前一位使用者的冰箱 ID
    identity.clearGroupId();
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
  /**
   * 更新使用者個人資料
   */
  updateProfile: async (data: any) => {
    const response = await authApi.updateProfile(data);

    // 更新本地儲存的使用者資料
    const currentUser = authService.getUser();
    if (currentUser && response.data) {
      const updatedUser = {
        ...currentUser,
        // 更新相關欄位
        name: response.data.name,
        // 注意：後端回傳的 profilePictureUrl 可能就是 avatar ID
        avatar:
          response.data.profilePictureUrl ||
          response.data.avatar ||
          currentUser.avatar,
        // 其他可能更新的欄位
      };

      authService.saveUser(updatedUser);
    }

    return response;
  },
};
