import { authApi } from '@/modules/auth/api/authApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileRequest } from '@/modules/auth/types';

/**
 * 更新個人資料 Mutation
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // 更新快取中的用戶資料
      queryClient.setQueryData(['GET_USER_PROFILE'], updatedUser);
      // 或者讓快取失效重新抓取
      // queryClient.invalidateQueries({ queryKey: ['GET_USER_PROFILE'] });
    },
  });
}
