import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, authService } from '@/modules/auth';
import { parsePreferences } from '@/modules/settings/utils/dietaryUtils';
import { mapBackendGenderToEnum } from '@/modules/auth/api/queries';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // 1. 確認 Cookie 與 Session 有效 (等同 GET /api/v2/auth/me)
        const response: any = await authApi.getProfile();
        const profileData = response.data ?? response;

        // 轉換為前端 User 格式
        const userData = {
          id: profileData.id,
          lineId: profileData.lineId,
          name:
            profileData.name ||
            profileData.displayName ||
            profileData.display_name ||
            '',
          avatar: profileData.profilePictureUrl || profileData.avatar || '',
          pictureUrl:
            profileData.profilePictureUrl || profileData.avatar || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          gender: mapBackendGenderToEnum(profileData.gender),
          customGender: profileData.customGender,
          email: profileData.email || undefined,
          dietaryPreference: profileData.preferences
            ? parsePreferences(profileData.preferences)
            : undefined,
        };

        // 2. 更新 authStore 與快取
        authService.saveUser(userData);
        queryClient.setQueryData(['GET_USER_PROFILE'], userData);

        // 3. 讀取並清除 pendingInviteToken
        const inviteToken = sessionStorage.getItem('pendingInviteToken');
        sessionStorage.removeItem('pendingInviteToken');

        // 4. 重導向
        if (inviteToken) {
          navigate(`/invite/${inviteToken}`, { replace: true });
        } else {
          navigate('/inventory', { replace: true });
        }
      } catch (err) {
        console.error('[AuthSuccess] Token 驗證失敗:', err);
        setError('登入驗證失敗，請重新登入');
        setTimeout(() => navigate('/auth/login', { replace: true }), 2500);
      }
    };

    verifyAndRedirect();
  }, [navigate, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {error ? (
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-primary-500 font-medium mb-2">{error}</p>
          <p className="text-sm text-neutral-400">正在返回登入頁面...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-success-600 font-medium">登入成功！</p>
          <p className="text-sm text-neutral-400 mt-1">正在為您導向...</p>
        </div>
      )}
    </div>
  );
};

export default AuthSuccess;
