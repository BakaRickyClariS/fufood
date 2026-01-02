import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import type { UserProfile } from '@/modules/settings/types/settings.types';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import { useFCMContext } from '@/shared/providers/FCMProvider';

// Components
import ProfileSection from '@/modules/settings/components/ProfileSection';
import DietaryPreferenceTags from '@/modules/settings/components/DietaryPreferenceTags';
import QuickActions from '@/modules/settings/components/QuickActions';
import OtherSettingsList from '@/modules/settings/components/OtherSettingsList';
import LogoutSection from '@/modules/settings/components/LogoutSection';
import { GroupApiTest } from '@/modules/groups/components/debug/GroupApiTest';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { unregisterToken } = useFCMContext();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Transform auth User to UserProfile type
  const userProfile: UserProfile = {
    ...user,
    name: user?.displayName || user?.name || '使用者',
    avatar: getUserAvatarUrl(user),
    // 直接傳遞 dietaryPreference，讓子元件處理 undefined 的情況
    dietaryPreference: user?.dietaryPreference,
  } as UserProfile;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // 登出前先解除 FCM Token 註冊
      await unregisterToken();
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        <ProfileSection user={userProfile} />

        <DietaryPreferenceTags preference={userProfile.dietaryPreference} />

        <QuickActions />

        <OtherSettingsList />

        {/* Pass user email if available in User object, assuming user.email exists */}
        <LogoutSection
          email={user?.email}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* 測試通知按鈕 */}
        <div className="flex flex-col gap-2">
          {import.meta.env.DEV && (
            <button
              onClick={async () => {
                if (Notification.permission === 'granted') {
                  const reg = await navigator.serviceWorker.ready;
                  reg.showNotification('FuFood 測試通知', {
                    body: '這是一條測試用的背景通知 🔔',
                    icon: '/pwa-192x192.png',
                  });
                } else {
                  alert('請先開啟通知權限');
                }
              }}
              className="w-full bg-blue-100 text-blue-600 py-3 rounded-xl font-bold"
            >
              測試背景通知 (Service Worker)
            </button>
          )}

          {/* 開發測試用：群組 API 測試按鈕 */}
          {import.meta.env.DEV && <GroupApiTest />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
