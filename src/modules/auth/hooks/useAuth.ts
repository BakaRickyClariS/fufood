import { useQueryClient } from '@tanstack/react-query';
import { useGetUserProfileQuery } from '../api/queries';
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
 * - logout: 登出（清除快取）
 */
export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const queryClient = useQueryClient();
  const user: User | null = query.data ?? null;

  /**
   * 登出
   * 清除 TanStack Query 快取
   */
  const logout = async (): Promise<void> => {
    // 清除 Profile 快取
    queryClient.removeQueries({ queryKey: ['GET_USER_PROFILE'] });
    // 重新取得（會返回 null 因為沒有 Cookie）
    await query.refetch();
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
