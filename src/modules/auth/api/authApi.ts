import { backendApi } from '@/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LINELoginRequest,
  LineLoginCallbackResponse,
  User,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ProfileResponse,
  UpdateProfilePayload,
  ProfileData,
} from '../types';
import { MOCK_USERS, MOCK_TOKEN } from './mock/authMockData';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// 取得後端 API 基底 URL（用於 LINE OAuth 等需要完整 URL 的情境）
const BACKEND_API_BASE = backendApi.getBaseUrl();

export const LineLoginUrl = `${BACKEND_API_BASE}/oauth/line/init`;

export const authApi = {
  /**
   * 使用者登入
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (data.email === 'fail@test.com') throw new Error('帳號或密碼錯誤');
      return {
        user: { ...MOCK_USERS[0], email: data.email },
        token: MOCK_TOKEN,
      };
    }
    return backendApi.post<LoginResponse>('/auth/login', data);
  },

  /**
   * 使用者註冊
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email: data.email,
          name: data.name || '新使用者',
          avatar: data.avatar || 'bg-blue-200',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: MOCK_TOKEN,
      };
    }
    return backendApi.post<RegisterResponse>('/auth/register', data);
  },

  /**
   * 登出
   * 呼叫後端 API 清除 HttpOnly Cookie
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    // 使用 backendApi 呼叫 logout 端點
    try {
      await backendApi.delete<void>('/api/v1/session');
    } catch (error) {
      // 204 或 200 都視為成功，其他錯誤僅警告
      console.warn('Logout API 回應非預期:', error);
    }
  },

  /**
   * 刷新 Token
   */
  refreshToken: async (
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        accessToken: 'mock_new_access_token_' + Date.now(),
        expiresIn: 3600,
      };
    }
    return backendApi.post<RefreshTokenResponse>('/auth/refresh', data);
  },

  /**
   * 取得當前使用者資訊
   */
  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }
    return backendApi.get<User>('/auth/me');
  },

  /**
   * 驗證 Token
   */
  checkToken: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }
    return backendApi.get<void>('/auth/check');
  },

  /**
   * 更新個人資料
   * PUT /api/v1/profile
   * @see docs/backend/api_profile_guide.md
   */
  updateProfile: async (
    data: UpdateProfilePayload,
  ): Promise<ProfileResponse> => {
    console.log('[AuthApi] UpdateProfile: Starting...', data);

    try {
      if (USE_MOCK) throw new Error('MOCK_MODE_FORCE');

      // 1. 取得當前完整資料
      console.log('[AuthApi] UpdateProfile: Fetching current profile...');
      const currentProfileRes =
        await backendApi.get<ProfileResponse>('/api/v1/profile');
      const currentProfile = currentProfileRes.data;

      // 2. 建構符合 Swagger 定義的 Payload
      // 依據 Swagger (uploaded_image_1)，端點為 /api/v1/profile 且 Body 包含特定欄位
      const payload = {
        name: data.name || currentProfile.name,
        email: data.email || currentProfile.email,
        profilePictureUrl:
          data.profilePictureUrl || currentProfile.profilePictureUrl,
        avatar: data.avatar || currentProfile.avatar,
        // Swagger 顯示欄位為 preferences (Array of string)
        preferences:
          data.preferences ||
          currentProfile.preferences ||
          (currentProfile as any).preference ||
          [],
        gender: data.gender ?? currentProfile.gender,
        customGender: data.customGender ?? currentProfile.customGender,
      };

      console.log(
        '[AuthApi] UpdateProfile: Sending PUT to /api/v1/profile',
        payload,
      );

      // 3. 發送 PUT 請求 (無 ID)
      // 如果此處發生 Failed to fetch，極高機率是後端 CORS 未開放 PUT 方法
      return await backendApi.put<ProfileResponse>(`/api/v1/profile`, payload);
    } catch (error) {
      if (!USE_MOCK) {
        const errMessage = (error as Error)?.message || '';
        // 偵測 CORS 相關錯誤
        if (errMessage.includes('Failed to fetch')) {
          console.error(
            '[AuthApi] Critical: CORS Error Detected. 請確認後端是否允許 PUT /api/v1/profile 的跨域請求 (Access-Control-Allow-Methods).',
          );
        }

        // @ts-ignore
        if (error?.message !== 'MOCK_MODE_FORCE') {
          console.warn('[AuthApi] UpdateProfile: Real API Failed:', error);
        }
        throw error;
      }

      // 3. Mock 備援邏輯
      console.log('[AuthApi] UpdateProfile: Fallback to Mock data');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 從 localStorage 取得當前用戶資料，避免用預設假資料覆蓋
      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr
        ? JSON.parse(currentUserStr)
        : MOCK_USERS[0];

      const mockProfileData: ProfileData = {
        id: currentUser.id || `mock-user-${Date.now()}`,
        lineId: currentUser.lineId || '',
        name: data.name || currentUser.name,
        profilePictureUrl:
          data.profilePictureUrl || currentUser.profilePictureUrl,
        email: data.email || currentUser.email,
        preferences: data.preferences || currentUser.preferences || [],
        avatar: data.avatar || currentUser.avatar,
        gender: data.gender ?? currentUser.gender ?? 0,
        customGender: data.customGender ?? currentUser.customGender,
        subscriptionTier: 0,
        createdAt: currentUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        '[AuthApi] UpdateProfile: Mock update complete',
        mockProfileData,
      );
      return { data: mockProfileData };
    }
  },

  /**
   * LINE 登入 Callback 處理
   * 處理後端回調帶回的認證資訊
   * 注意：使用原生 fetch 進行 OAuth 回調，因為需要處理重定向
   */
  handleLineCallback: async (
    data: LINELoginRequest,
  ): Promise<LineLoginCallbackResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        user: {
          ...MOCK_USERS[0],
          lineId: 'U1234567890',
          displayName: 'LINE 測試用戶',
          pictureUrl: 'https://profile.line-scdn.net/0h3Example',
        },
        token: MOCK_TOKEN,
      };
    }

    // 使用原生 fetch 呼叫 OAuth callback（需要處理重定向）
    const url = new URL(`${BACKEND_API_BASE}/oauth/line/callback`);
    if (data.code) url.searchParams.append('code', data.code);
    if (data.state) url.searchParams.append('state', data.state);

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `LINE API 錯誤: ${response.status}`);
    }

    return response.json();
  },

  /**
   * 取得當前登入用戶資訊（透過 HttpOnly Cookie 驗證）
   * 成功回傳用戶資料，未登入回傳 401
   */
  getProfile: async (): Promise<ProfileResponse> => {
    return backendApi.get<ProfileResponse>('/api/v1/profile');
  },
};
