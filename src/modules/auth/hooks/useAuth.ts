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

    // 監聽 storage 事件（跨 tab 同步）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null;
        setUser(newUser);
      }
    };

    // 監聽自訂事件（同視窗內的 localStorage 更新）
    const handleUserUpdate = () => {
      const savedUser = authService.getUser();
      setUser(savedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
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

  const mockLogin = useCallback((avatarId: number, displayName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = authService.mockLogin(avatarId, displayName);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '假登入失敗';
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
    mockLogin,
    register,
    logout,
    getLineLoginUrl,
    refreshUser,
  };
};
