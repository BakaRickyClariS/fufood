import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { User } from '../types';
import { parsePreferences } from '@/modules/settings/utils/dietaryUtils';
import { mapBackendTierToFrontend } from './queries';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const useSignOutMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess() {
      // 設置登出標記
      sessionStorage.setItem('logged_out', 'true');

      // 清除 localStorage 中的用戶資料（無論是 Mock 還是真實 API 模式）
      localStorage.removeItem('user');
      localStorage.removeItem('activeRefrigeratorId');

      // Mock 模式：額外清除假 token 資料
      if (USE_MOCK) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
      }

      // 清除用戶 Profile 快取
      client.invalidateQueries({
        queryKey: ['GET_USER_PROFILE'],
      });
      client.setQueryData(['GET_USER_PROFILE'], null);
    },
  });
};

export const useUpdateProfileMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (response) => {
      // 讓 GET_USER_PROFILE 失效以觸發重新抓取
      client.invalidateQueries({ queryKey: ['GET_USER_PROFILE'] });

      // 同時也可以手動更新 cache 以獲得更即時的 UI 反應
      if (response && response.data) {
        const profileData = response.data;
        const existingUser = authService.getUser();

        // 將 ProfileData 轉換為 User 格式，確保型別一致
        const updatedUser: User = {
          ...existingUser,
          id: profileData.id ?? existingUser?.id,
          lineId: profileData.lineId ?? existingUser?.lineId,
          name: profileData.name ?? existingUser?.name,
          displayName: profileData.name ?? existingUser?.displayName,
          avatar:
            profileData.profilePictureUrl ??
            profileData.avatar ??
            existingUser?.avatar ??
            '',
          pictureUrl: profileData.profilePictureUrl ?? existingUser?.pictureUrl,
          email: profileData.email ?? existingUser?.email,
          dietaryPreference: profileData.preferences
            ? parsePreferences(profileData.preferences)
            : existingUser?.dietaryPreference,
          membershipTier: profileData.subscriptionTier
            ? mapBackendTierToFrontend(profileData.subscriptionTier)
            : existingUser?.membershipTier,
          createdAt: existingUser?.createdAt ?? new Date(),
          updatedAt: new Date(),
        };

        client.setQueryData(['GET_USER_PROFILE'], updatedUser);
      }
    },
  });
};
