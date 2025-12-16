import { useGetUserProfileQuery } from '../api/queries';
import type { User } from '../types';

/**
 * 認證 Hook
 * 提供用戶認證狀態與資訊
 * 
 * @returns {Object} 認證狀態
 * - user: 用戶資訊（含 LINE 頭貼 pictureUrl）
 * - isAuthenticated: 是否已登入
 * - isLoading: 是否正在載入
 * - refetch: 手動重新取得用戶資訊
 * - error: 錯誤資訊
 */
export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const user: User | null = query.data ?? null;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  };
};
