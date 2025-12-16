import { useQueryClient } from '@tanstack/react-query';
import { useGetUserProfileQuery } from '../api/queries';
import { authApi } from '../api';
import type { User } from '../types';

/**
 * 認證 Hook
 * 提供用戶認證狀態與資訊（基於真實 API）
 * 
 * @returns {Object} 認證狀態
 * - user: 用戶資訊（含 LINE 頭貼 pictureUrl）
 * - isAuthenticated: 是否已登入
 * - isLoading: 是否正在載入
 * - refetch: 手動重新取得用戶資訊
 * - error: 錯誤資訊
 * - logout: 登出（清除快取與 Cookie）
 */
export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const queryClient = useQueryClient();
  const user: User | null = query.data ?? null;

  /**
   * 登出
   * 1. 呼叫後端 API 清除 HttpOnly Cookie
   * 2. 清除 TanStack Query 快取
   * 3. 重新取得 Profile（會返回 null）
   */
  const logout = async (): Promise<void> => {
    try {
      // 呼叫後端 API 清除 HttpOnly Cookie
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API 呼叫失敗:', error);
    }
    
    // 清除 Profile 快取
    queryClient.removeQueries({ queryKey: ['GET_USER_PROFILE'] });
    
    // 設定快取為 null（已登出狀態）
    queryClient.setQueryData(['GET_USER_PROFILE'], null);
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
