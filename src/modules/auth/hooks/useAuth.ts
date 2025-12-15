import { useCallback } from 'react';
import { authApi } from '../api';
import { useGetUserProfileQuery } from '../api/queries';

export const useAuth = () => {
  const query = useGetUserProfileQuery();

  /**
   * 取得 LINE 登入 URL
   */
  const getLineLoginUrl = useCallback(() => {
    return authApi.getLineLoginUrl();
  }, []);

  const user = query.data?.data;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    error: query.error,
    getLineLoginUrl,
  };
};
