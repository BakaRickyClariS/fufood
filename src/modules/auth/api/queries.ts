import { useQuery } from '@tanstack/react-query';
import type { User, ProfileResponse } from '../types';
import { backendApi } from '@/api/client';

import { MOCK_USERS } from './mock/authMockData';

/**
 * 從後端 Profile API 取得已登入用戶資訊
 *
 * 邏輯說明：
 * 1. LINE 登入：使用 HttpOnly Cookie，優先呼叫真實 API
 * 2. 電子郵件登入（Mock）：使用 localStorage 的 authToken
 * 3. 兩種登入方式獨立運作，不受 VITE_USE_MOCK_API 環境變數影響
 */
export async function getUserProfile(): Promise<User | null> {
  // 檢查登出標記 - 如果用戶已登出，不要發送 API 請求
  const loggedOut = sessionStorage.getItem('logged_out');
  if (loggedOut === 'true') {
    return null;
  }

  // 檢查是否有 LINE 登入儲存的用戶資料（透過 LineLoginCallback 儲存）
  const userStr = localStorage.getItem('user');

  // 優先嘗試真實 API（LINE 登入使用 HttpOnly Cookie）
  try {
    const result = await backendApi.get<ProfileResponse>('/api/v1/profile');

    // 將 API 回傳的 ProfileData 轉換為 User 格式
    return {
      id: result.data.id,
      lineId: result.data.lineId,
      name: result.data.name,
      displayName: result.data.name,
      avatar: result.data.profilePictureUrl,
      pictureUrl: result.data.profilePictureUrl, // LINE 頭貼 URL
      createdAt: new Date(result.data.createdAt),
      updatedAt: new Date(result.data.updatedAt),
    };
  } catch (error) {
    // 真實 API 失敗（401 或其他錯誤），嘗試 Mock 備援
    const is401 = error instanceof Error && error.message.includes('401');

    if (!is401) {
      // 非 401 錯誤，繼續檢查 Mock 狀態（可能是網路問題或後端未啟動）
      console.warn('Profile API 失敗，嘗試 Mock 備援:', error);
    }
  }

  // Mock 備援：電子郵件登入（檢查 localStorage 的 authToken）
  const mockToken = localStorage.getItem('authToken');

  // 如果有 mock token（電子郵件登入），返回 Mock 用戶
  if (mockToken && mockToken.startsWith('mock_')) {
    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 嘗試從 localStorage 取得已登入的用戶資料
    if (userStr) {
      try {
        const savedUser = JSON.parse(userStr);
        return {
          ...savedUser,
          lineId: savedUser.lineId || 'U1234567890',
          displayName: savedUser.displayName || savedUser.name,
          pictureUrl: savedUser.pictureUrl || savedUser.avatar,
        };
      } catch {
        // JSON 解析失敗，返回預設用戶
      }
    }

    // 有 token 但無 user 資料，返回預設 Mock 用戶
    return {
      ...MOCK_USERS[0],
      lineId: 'U1234567890',
      displayName: MOCK_USERS[0].name,
      pictureUrl: MOCK_USERS[0].avatar,
    };
  }

  // 真實 API 失敗且無 Mock token，返回 null（未登入）
  return null;
}

/**
 * TanStack Query Hook - 取得用戶 Profile
 *
 * 優化配置：
 * - retry: false - 401 時不重試
 * - staleTime: 5 分鐘 - 減少不必要的請求
 * - refetchOnWindowFocus: false - 視窗聚焦時不自動重新取得
 */
export function useGetUserProfileQuery() {
  return useQuery({
    queryKey: ['GET_USER_PROFILE'],
    queryFn: getUserProfile,
    retry: false, // 401 時不要重試
    staleTime: 1000 * 60 * 5, // 5 分鐘內資料視為新鮮
    refetchOnWindowFocus: true, // 視窗聚焦時不自動重新取得
    refetchOnMount: false, // 元件掛載時不自動重新取得（如果已有快取）
  });
}
