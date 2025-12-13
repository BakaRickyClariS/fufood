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
} from '../types';
import { MOCK_USERS, MOCK_TOKEN } from './mock/authMockData';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

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
        },
        token: MOCK_TOKEN,
      };
    }
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }
    return apiClient.post<void>('/auth/logout');
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
   * 取得 LINE 登入 URL
   * 直接返回後端 OAuth 入口 URL
   */
  getLineLoginUrl: (): string => {
    const LINE_API_BASE = import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';
    return `${LINE_API_BASE}/oauth/line/init`;
  },

  /**
   * LINE 登入 Callback 處理
   * 處理後端回調帶回的認證資訊
   */
  handleLineCallback: async (data: LINELoginRequest): Promise<LineLoginCallbackResponse> => {
    const LINE_API_BASE = import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';
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
    return apiClient.get<LineLoginCallbackResponse>(`${LINE_API_BASE}/oauth/line/callback`, {
      code: data.code,
      state: data.state,
    });
  },
};
