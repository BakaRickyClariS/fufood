import { useQuery } from '@tanstack/react-query';
import type { User, ProfileResponse } from '../types';
import { backendApi } from '@/api/client';

import { MOCK_USERS } from './mock/authMockData';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * 從後端 Profile API 取得已登入用戶資訊
 * 使用 HttpOnly Cookie 進行認證
 */
export async function getUserProfile(): Promise<User | null> {
  // 檢查登出標記 - 如果用戶已登出，不要發送 API 請求
  const loggedOut = sessionStorage.getItem('logged_out');
  if (loggedOut === 'true') {
    return null;
  }

  // Mock 模式
  if (USE_MOCK) {
    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ...MOCK_USERS[0],
      // 確保 Mock 資料有一致的欄位
      lineId: 'U1234567890', 
      displayName: MOCK_USERS[0].name,
      pictureUrl: MOCK_USERS[0].avatar,
    };
  }

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
    // 未登入時返回 null（不拋出錯誤）
    if (error instanceof Error && error.message.includes('401')) {
      return null;
    }
    throw error;
  }
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
