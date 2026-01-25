import { authApi } from '@/modules/auth/api/authApi';
import { authService } from '@/modules/auth/services/authService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfilePayload, ProfileResponse, User } from '@/modules/auth/types';
import { mapBackendTierToFrontend } from '@/modules/auth/api/queries';
import { parsePreferences } from '@/modules/settings/utils/dietaryUtils';

/**
 * 更新個人資料請求參數
 */
type UpdateProfileParams = {
  data: UpdateProfilePayload;
};

/**
 * 更新個人資料 Mutation
 * PUT /api/v1/profile
 * 成功後同時更新 React Query 快取和 localStorage
 * @see docs/backend/api_profile_guide.md
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: UpdateProfileParams): Promise<ProfileResponse> => {
      return authApi.updateProfile(data);
    },
    onSuccess: (response, variables) => {
      if (!response.data) return;

      const profileData = response.data;
      const requestedTier = variables.data.subscriptionTier;

      // 取得現有的 user 資料，避免覆蓋重要欄位
      const existingUser = authService.getUser();

      // 計算新的會員等級 (如果變數中有 mock 值，優先使用，否則使用 API 回傳值)
      const newMembershipTier = requestedTier !== undefined
        ? mapBackendTierToFrontend(requestedTier)
        : mapBackendTierToFrontend(profileData.subscriptionTier);

      // 將 ProfileData 轉換為 User 格式，保留原有資料
      const updatedUser: User = {
        // 保留原有基礎資料
        ...existingUser,
        // 更新從 API 回傳的資料
        id: profileData.id,
        lineId: profileData.lineId,
        name: profileData.name,
        displayName: profileData.name, // 使用 name 作為 displayName
        avatar: profileData.profilePictureUrl ?? profileData.avatar ?? existingUser?.avatar ?? '',
        pictureUrl: profileData.profilePictureUrl ?? existingUser?.pictureUrl,
        email: profileData.email ?? existingUser?.email ?? undefined,
        dietaryPreference: profileData.preferences 
          ? parsePreferences(profileData.preferences) 
          : existingUser?.dietaryPreference,
        membershipTier: newMembershipTier,
        createdAt: existingUser?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      // 更新 React Query 快取（轉換後的 User 格式）
      queryClient.setQueryData(['GET_USER_PROFILE'], updatedUser);

      // 同步更新 localStorage
      authService.saveUser(updatedUser);
    },
  });
};
