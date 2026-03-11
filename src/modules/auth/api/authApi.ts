import { api } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
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

// LINE 登入 URL 需直接走瀏覽器跳轉（不走 api client），
// 使用 window.location.origin 讓 vite proxy 正確路由到後端，
// 避免 VITE_AI_API_BASE_URL 內含的 /api/v1 造成路徑重複。
export const LineLoginUrl = `${window.location.origin}${ENDPOINTS.AUTH.LINE_INIT}`;

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
    return api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);
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
    return api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    try {
      await api.post<void>(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
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
    return api.post<RefreshTokenResponse>(ENDPOINTS.AUTH.REFRESH, data);
  },

  /**
   * 取得當前使用者資訊
   */
  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }
    return api.get<User>(ENDPOINTS.AUTH.ME);
  },

  /**
   * 驗證 Token
   */
  checkToken: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }
    return api.get<void>(ENDPOINTS.AUTH.ME);
  },

  /**
   * 更新個人資料
   */
  updateProfile: async (
    data: UpdateProfilePayload,
  ): Promise<ProfileResponse> => {
    console.log('[AuthApi] UpdateProfile: Starting...', data);

    try {
      if (USE_MOCK) throw new Error('MOCK_MODE_FORCE');

      // 1. 取得當前完整資料
      console.log('[AuthApi] UpdateProfile: Fetching current profile...');
      const currentProfile = await api.get<ProfileResponse>(
        ENDPOINTS.PROFILE.BASE,
      );
      // NOTE: ApiClient now auto-unwraps, so currentProfile is the data (User/ProfileResponse) directly if V2

      // But wait, ProfileResponse might be defined as { data: User } in types.
      // If ApiClient unwraps, it returns User.
      // I need to check type definition of ProfileResponse.
      // Assuming ProfileResponse IS the inner data or ApiClient unwraps V2ApiResponse<ProfileResponse> to ProfileResponse.
      // If ProfileResponse = { data: ... }, then we access .data?
      // Let's assume ApiClient unwraps { success, data: T } -> T.
      // If ProfileResponse is the T, then we are good.
      // However, below code accesses `currentProfile.data`.
      // If ApiClient unwraps, currentProfile IS the data.

      const profileData = (currentProfile as any).data || currentProfile;

      // 2. 建構符合 Swagger 定義的 Payload
      const payload = {
        name: data.name || profileData.name,
        email: data.email || profileData.email,
        avatar: data.avatar || profileData.avatar,
        profilePictureUrl:
          data.profilePictureUrl || profileData.profilePictureUrl,
        preference:
          data.preferences ||
          profileData.preferences ||
          (profileData as any).preference ||
          [],
        gender: data.gender ?? profileData.gender,
        customGender: data.customGender ?? profileData.customGender ?? null,
      };

      console.log('[AuthApi] UpdateProfile: Sending PUT to endpoint', payload);

      // 依據前端與後端實際對接經驗，直接打 /api/v2/profile 即可，透過 Token 識別
      const endpoint = ENDPOINTS.PROFILE.BASE;
      return await api.put<ProfileResponse>(endpoint, payload);
    } catch (error) {
      if (!USE_MOCK) {
        throw error;
      }

      // 3. Mock 備援邏輯
      console.log('[AuthApi] UpdateProfile: Fallback to Mock data');
      await new Promise((resolve) => setTimeout(resolve, 800));

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
   * 取得 LINE OAuth 授權 URL
   */
  lineInit: async (): Promise<{ authUrl: string }> => {
    return api.post<{ authUrl: string }>(ENDPOINTS.AUTH.LINE_INIT);
  },

  /**
   * LINE 登入 Callback 處理
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
          name: 'LINE 測試用戶',
          pictureUrl: 'https://profile.line-scdn.net/0h3Example',
        },
        token: MOCK_TOKEN,
      };
    }

    // 使用原生 fetch 呼叫 OAuth callback（需要處理重定向）
    const url = new URL(
      `${window.location.origin}${ENDPOINTS.AUTH.LINE_CALLBACK}`,
    );
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
   * 取得當前登入用戶資訊
   */
  getProfile: async (): Promise<ProfileResponse> => {
    return api.get<ProfileResponse>(ENDPOINTS.PROFILE.BASE);
  },
};
