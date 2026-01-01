import { useQuery } from '@tanstack/react-query';
import type { User, ProfileResponse, GenderValue, MembershipTier } from '../types';
import { Gender } from '../types';
import { backendApi } from '@/api/client';
import { MOCK_USERS } from './mock/authMockData';

// Gender 字串轉數值對應表
const mapBackendGenderToEnum = (genderStr: string | number | undefined | null): GenderValue => {
  if (typeof genderStr === 'number') return genderStr as GenderValue;
  const g = String(genderStr).toLowerCase();
  if (g === 'male') return Gender.Male;
  if (g === 'female') return Gender.Female;
  if (g === 'nonbinary' || g === 'non-binary') return Gender.NonBinary;
  if (g === 'other') return Gender.Other;
  return Gender.NotSpecified;
};

// Membership 轉換 ("Free" -> "free")
const mapBackendTierToFrontend = (tier: string | number | undefined | null): MembershipTier => {
  const t = String(tier).toLowerCase();
  if (t === 'premium') return 'premium';
  if (t === 'vip') return 'vip';
  return 'free';
};

/**
 * 從後端 Profile API 取得已登入用戶資訊
 */
export async function getUserProfile(): Promise<User | null> {
  // 檢查登出標記
  const loggedOut = sessionStorage.getItem('logged_out');
  if (loggedOut === 'true') {
    return null;
  }

  // 檢查 localStorage 中的 user 資料 (LINE 登入時會存)
  const userStr = localStorage.getItem('user');

  try {
    const result = await backendApi.get<ProfileResponse>('/api/v1/profile');

    // 將 API 回傳的 ProfileData (可能含字串 enum) 轉換為 User 格式 (數值 enum)
    const backendData = result.data as any; // 使用 any 繞過 TS 檢查，因為後端回傳型別與文件不符
    
    console.log('[UserProfile] Raw Gender from Backend:', backendData.gender);
    const mappedGender = mapBackendGenderToEnum(backendData.gender);
    console.log('[UserProfile] Mapped Gender:', mappedGender);
    
    return {
      id: backendData.id,
      lineId: backendData.lineId,
      name: backendData.name,
      displayName: backendData.name,
      avatar: backendData.profilePictureUrl ?? '',
      pictureUrl: backendData.profilePictureUrl ?? undefined,
      email: backendData.email || undefined,
      gender: mappedGender,
      customGender: backendData.customGender,
      membershipTier: mapBackendTierToFrontend(backendData.subscriptionTier),
      createdAt: new Date(backendData.createdAt),
      updatedAt: new Date(backendData.updatedAt),
      // 飲食偏好暫時使用預設值或從 preference 陣列轉換
      dietaryPreference: backendData.preference ? {
        cookingFrequency: '1-2' as const,
        prepTime: '15-30' as const,
        seasoningLevel: 'moderate' as const,
        restrictions: []
      } : undefined,
    };
  } catch (error) {
    const is401 = error instanceof Error && error.message.includes('401');

    if (!is401) {
      console.warn('Profile API 失敗，嘗試 Mock 備援:', error);
    }
  }

  // Mock 備援：電子郵件登入
  const mockToken = localStorage.getItem('authToken');

  if (mockToken && mockToken.startsWith('mock_')) {
    await new Promise((resolve) => setTimeout(resolve, 50));

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
        // ignore
      }
    }

    return {
      ...MOCK_USERS[0],
      lineId: 'U1234567890',
      displayName: MOCK_USERS[0].name,
      pictureUrl: MOCK_USERS[0].avatar,
    };
  }

  return null;
}

export function useGetUserProfileQuery() {
  /**
   * 判斷是否應該執行 Profile Query
   * 
   * 重要修正：使用 HttpOnly Cookie 認證時，應預設嘗試呼叫 API，
   * 讓後端回傳 401 來判斷未登入狀態，而非依賴 localStorage。
   * 
   * 只有以下情況不執行 query：
   * 1. 明確標記為已登出 (logged_out = 'true')
   */
  const shouldQuery = ((): boolean => {
    const loggedOut = sessionStorage.getItem('logged_out');
    if (loggedOut === 'true') return false;

    // HttpOnly Cookie 認證模式：預設嘗試呼叫 API
    // 即使 localStorage 沒有 user 資料，Cookie 可能仍然有效
    return true;
  })();

  return useQuery({
    queryKey: ['GET_USER_PROFILE'],
    queryFn: getUserProfile,
    enabled: shouldQuery,
    retry: false,
    // 設定 5 分鐘內資料視為新鮮，避免頻繁 refetch 導致 loading 閃爍
    staleTime: 5 * 60 * 1000,
    // 切換視窗焦點時不自動 refetch（減少不必要的 loading）
    refetchOnWindowFocus: false,
    // mount 時只在沒有快取資料時 fetch
    refetchOnMount: true,
  });
}
