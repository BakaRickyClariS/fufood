import { apiClient } from '@/lib/apiClient';
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
  UpdateProfileRequest,
  ProfileResponse,
} from '../types';
import { MOCK_USERS, MOCK_TOKEN } from './mock/authMockData';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

const LINE_API_BASE =
  import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';

export const LineLoginUrl = `${LINE_API_BASE}/oauth/line/init`;

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
    return apiClient.post<LoginResponse>('/auth/login', data);
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
    return apiClient.post<RegisterResponse>('/auth/register', data);
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

    // 使用原生 fetch 呼叫 LINE API 的 logout 端點
    // 必須攜帶 credentials: 'include' 以清除 HttpOnly Cookie
    const response = await fetch(`${LINE_API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 204 或 200 都視為成功
    if (!response.ok && response.status !== 204) {
      console.warn('Logout API 回應非預期:', response.status);
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
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
  },

  /**
   * 取得當前使用者資訊
   */
  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }
    return apiClient.get<User>('/auth/me');
  },

  /**
   * 驗證 Token
   */
  checkToken: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }
    return apiClient.get<void>('/auth/check');
  },

  /**
   * 更新個人資料
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...MOCK_USERS[0], ...data };
    }
    return apiClient.put<User>('/auth/update-profile', data);
  },

  /**
   * LINE 登入 Callback 處理
   * 處理後端回調帶回的認證資訊
   * 注意：使用原生 fetch 而非 apiClient，因為這是外部 API
   */
  handleLineCallback: async (
    data: LINELoginRequest,
  ): Promise<LineLoginCallbackResponse> => {
    const LINE_API_BASE =
      import.meta.env.VITE_LINE_API_BASE_URL ||
      'https://api.fufood.jocelynh.me';
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

    // 使用原生 fetch 呼叫外部 LINE API，不使用 apiClient（會拼接錯誤的 baseUrl）
    const url = new URL(`${LINE_API_BASE}/oauth/line/callback`);
    if (data.code) url.searchParams.append('code', data.code);
    if (data.state) url.searchParams.append('state', data.state);

    const response = await fetch(url.toString(), {
      method: 'GET',
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
    const LINE_API_BASE =
      import.meta.env.VITE_LINE_API_BASE_URL ||
      'https://api.fufood.jocelynh.me';

    // 使用原生 fetch 帶上 credentials: 'include' 以攜帶 HttpOnly Cookie
    const response = await fetch(`${LINE_API_BASE}/api/v1/profile`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 ? '未登入' : `API 錯誤: ${response.status}`,
      );
    }

    return response.json();
  },
};
