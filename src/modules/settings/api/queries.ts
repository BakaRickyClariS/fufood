import { authApi } from '@/modules/auth/api/authApi';
import { authService } from '@/modules/auth/services/authService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileRequest } from '@/modules/auth/types';

/**
 * 更新個人資料 Mutation
 * 成功後同時更新 React Query 快取和 localStorage
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // 更新 React Query 快取
      queryClient.setQueryData(['GET_USER_PROFILE'], updatedUser);
      // 同步更新 localStorage 以確保持久化
      authService.saveUser(updatedUser);
    },
  });
}
