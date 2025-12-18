import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApi } from '@/api/client';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * 登出 API
 * 使用 DELETE /api/v1/session 清除 HttpOnly Cookie
 * Mock 模式下直接返回成功
 */
export const signOut = async (): Promise<void> => {
  if (USE_MOCK) {
    // Mock 模式：模擬 API 延遲後返回成功
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }
  return backendApi.delete<void>('/api/v1/session');
};

/**
 * 登出 Mutation Hook
 * 用於 Settings 頁面的登出按鈕
 */
export const useSignOutMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess() {
      // 設置登出標記
      sessionStorage.setItem('logged_out', 'true');

      // Mock 模式：清除 localStorage 中的假資料
      if (USE_MOCK) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
      }

      // 清除用戶 Profile 快取
      client.invalidateQueries({
        queryKey: ['GET_USER_PROFILE'],
      });
      client.setQueryData(['GET_USER_PROFILE'], null);
    },
  });
};
