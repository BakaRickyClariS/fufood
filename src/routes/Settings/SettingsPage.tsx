import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import type { UserProfile } from '@/modules/settings/types/settings.types';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import { useFCMContext } from '@/shared/providers/FCMProvider';

// Components
import ProfileSection from '@/modules/settings/components/ProfileSection';
import QuickActions from '@/modules/settings/components/QuickActions';
import OtherSettingsList from '@/modules/settings/components/OtherSettingsList';
import PermissionSettings from '@/modules/settings/components/PermissionSettings';
import LogoutSection from '@/modules/settings/components/LogoutSection';
import { GroupApiTest } from '@/modules/groups/components/debug/GroupApiTest';

/** FCM 狀態檢視按鈕 */
const FCMStatusButton = () => {
  const fcm = useFCMContext();
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="bg-amber-50 rounded-xl p-4">
      <button
        onClick={() => setShowStatus(!showStatus)}
        className="w-full bg-amber-100 text-amber-700 py-3 rounded-xl font-bold"
      >
        {showStatus ? '隱藏 FCM 狀態' : '檢視 FCM 狀態'}
      </button>
      {showStatus && (
        <div className="mt-3 text-sm space-y-2 bg-white p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-500">瀏覽器支援</span>
            <span
              className={fcm.isSupported ? 'text-green-600' : 'text-red-600'}
            >
              {fcm.isSupported ? '✅ 支援' : '❌ 不支援'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">通知權限</span>
            <span
              className={
                fcm.permission === 'granted'
                  ? 'text-green-600'
                  : 'text-amber-600'
              }
            >
              {fcm.permission === 'granted'
                ? '✅ 已允許'
                : fcm.permission === 'denied'
                  ? '❌ 已拒絕'
                  : '⏳ 尚未請求'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Token 已註冊後端</span>
            <span
              className={fcm.isRegistered ? 'text-green-600' : 'text-amber-600'}
            >
              {fcm.isRegistered ? '✅ 已註冊' : '⏳ 尚未註冊'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">FCM Token</span>
            <span className="text-gray-700 text-xs max-w-[150px] truncate">
              {fcm.token ? fcm.token.substring(0, 20) + '...' : '無'}
            </span>
          </div>
          {fcm.error && (
            <div className="text-red-500 text-xs mt-2">錯誤：{fcm.error}</div>
          )}
          {!fcm.isRegistered && fcm.permission === 'granted' && (
            <button
              onClick={() => fcm.requestPermission()}
              disabled={fcm.isLoading}
              className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg text-sm"
            >
              {fcm.isLoading ? '處理中...' : '重新取得 Token'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import EditProfile from '@/routes/Settings/EditProfile';
import EditDietaryPreference from '@/routes/Settings/EditDietaryPreference';
import Subscription from '@/routes/Settings/Subscription';
import PurchaseHistory from '@/routes/Settings/PurchaseHistory';
import HelpCenter from '@/routes/Settings/HelpCenter';
import ReportProblem from '@/routes/Settings/ReportProblem';
import AppGuide from '@/routes/Settings/AppGuide';
import LineBinding from '@/routes/Settings/LineBinding';
import ConsumptionReason from '@/routes/Settings/ConsumptionReason';

// ...

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { unregisterToken } = useFCMContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeModal = searchParams.get('modal');

  const handleNavigate = (key: string) => {
    setSearchParams({ modal: key });
  };

  const handleCloseModal = () => {
    setSearchParams({});
  };

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
    <div className="min-h-screen bg-neutral-100 pb-24">
      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        <ProfileSection user={userProfile} onNavigate={handleNavigate} />

        <QuickActions onNavigate={handleNavigate} />

        <PermissionSettings />

        <OtherSettingsList onNavigate={handleNavigate} />

        {/* ... */}

        <LogoutSection
          email={user?.email}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* 測試通知按鈕 - 已透過 restore 恢復 */}
        {/* ... (keeping existing debug buttons if matched, but here I am targeting line 120-132 mostly) */}
        {/* Wait, I can't match "..." easily. I should target specific lines. */}

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

          {/* FCM 狀態檢視按鈕 */}
          {import.meta.env.DEV && <FCMStatusButton />}

          {/* 開發測試用：群組 API 測試按鈕 */}
          {import.meta.env.DEV && <GroupApiTest />}
        </div>
      </div>

      {/* Modals */}
      <EditProfile
        isOpen={activeModal === 'profile'}
        onClose={handleCloseModal}
      />
      <EditDietaryPreference
        isOpen={activeModal === 'dietary-preference'}
        onClose={handleCloseModal}
      />
      <Subscription
        isOpen={activeModal === 'subscription'}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
      <PurchaseHistory
        isOpen={activeModal === 'purchase-history'}
        onClose={handleCloseModal}
      />
      <HelpCenter isOpen={activeModal === 'help'} onClose={handleCloseModal} />
      <ReportProblem
        isOpen={activeModal === 'report'}
        onClose={handleCloseModal}
      />
      <AppGuide isOpen={activeModal === 'guide'} onClose={handleCloseModal} />
      <LineBinding
        isOpen={activeModal === 'line-binding'}
        onClose={handleCloseModal}
      />
      <ConsumptionReason
        isOpen={activeModal === 'consumption-reasons'}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SettingsPage;
