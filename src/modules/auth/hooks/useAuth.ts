import { useQueryClient } from '@tanstack/react-query';
import { useGetUserProfileQuery } from '../api/queries';
import { authApi } from '../api';

export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const queryClient = useQueryClient();
  const user = query.data ?? null;

  /**
   * 登出
   * 1. 嘗試呼叫後端 API 清除 HttpOnly Cookie（可能失敗）
   * 2. 清除 TanStack Query 快取
   * 3. 清除 localStorage 的 user
   * 4. 設定登出標記防止自動重新登入
   */
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API 呼叫失敗:', error);
    }
    
    // 清除 Profile 快取
    queryClient.removeQueries({ queryKey: ['GET_USER_PROFILE'] });
    queryClient.setQueryData(['GET_USER_PROFILE'], null);
    
    // 清除 localStorage
    localStorage.removeItem('user');
    
    // 設定登出標記（用於防止 Cookie 殘留時自動登入）
    sessionStorage.setItem('logged_out', 'true');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
    logout,
  };
};
