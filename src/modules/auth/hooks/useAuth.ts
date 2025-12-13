import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { authApi } from '../api';
import type { User, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && !authService.isTokenExpired()) {
        setUser(savedUser);
      } else {
        authService.clearToken();
        authService.clearUser();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '登入失敗';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '註冊失敗';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 取得 LINE 登入 URL
   */
  const getLineLoginUrl = useCallback(() => {
    return authApi.getLineLoginUrl();
  }, []);

  /**
   * 重新整理用戶資訊（從 localStorage）
   */
  const refreshUser = useCallback(() => {
    const savedUser = authService.getUser();
    setUser(savedUser);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    getLineLoginUrl,
    refreshUser,
  };
};

