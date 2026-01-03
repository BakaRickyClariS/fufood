import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const useSignOutMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess() {
      // 設置登出標記
      sessionStorage.setItem('logged_out', 'true');

      // 清除 localStorage 中的用戶資料（無論是 Mock 還是真實 API 模式）
      localStorage.removeItem('user');
      localStorage.removeItem('activeRefrigeratorId');

      // Mock 模式：額外清除假 token 資料
      if (USE_MOCK) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
      }

      // 清除用戶 Profile 快取
      client.invalidateQueries({
        queryKey: ['GET_USER_PROFILE'],
      });
      client.setQueryData(['GET_USER_PROFILE'], null);
    },
  });
};
