import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendApi } from '@/api/client';

/**
 * 登出 API
 * 使用 DELETE /api/v1/session 清除 HttpOnly Cookie
 */
export const signOut = () => {
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
      // 清除用戶 Profile 快取
      client.invalidateQueries({
        queryKey: ['GET_USER_PROFILE'],
      });
      client.setQueryData(['GET_USER_PROFILE'], null);
    },
  });
};
