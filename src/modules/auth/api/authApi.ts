import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LINELoginRequest,
  User,
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
      // Mock 實作
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 模擬驗證
      if (data.email === 'test@example.com' && data.password === 'password') {
        return {
          user: MOCK_USERS[0],
          token: MOCK_TOKEN,
        };
      }
      // 為了方便測試，只要不是特定錯誤帳號都讓它過，或者嚴格一點
      // 這裡簡單一點，只要有輸入就讓過，除了特定測試失敗的案例
      if (data.email === 'fail@test.com') {
        throw new Error('帳號或密碼錯誤');
      }

      return {
        user: {
          ...MOCK_USERS[0],
          email: data.email,
        },
        token: MOCK_TOKEN,
      };
    }

    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('登入失敗');
    return response.json();
  },

  /**
   * 使用者註冊
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name || '新使用者',
        avatar: data.avatar || 'bg-blue-200',
        createdAt: new Date(),
      };

      return {
        user: newUser,
        token: MOCK_TOKEN,
      };
    }

    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('註冊失敗');
    return response.json();
  },

  /**
   * LINE 登入
   */
  loginWithLINE: async (data: LINELoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        user: MOCK_USERS[0],
        token: MOCK_TOKEN,
      };
    }

    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('LINE 登入失敗');
    return response.json();
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    // TODO: 真實 API 呼叫
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  /**
   * 取得當前使用者資訊
   */
  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }

    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error('無法取得使用者資訊');
    return response.json();
  },
};
