import { Link } from 'react-router-dom';
import { ChevronRight, Bell, BellOff, BellRing } from 'lucide-react';
import { useFCMContext } from '@/shared/providers/FCMProvider';

/**
 * 取得通知權限狀態的顯示資訊
 */
const getPermissionDisplay = (
  permission: NotificationPermission,
  isSupported: boolean,
) => {
  if (!isSupported) {
    return {
      icon: <BellOff className="w-5 h-5 text-neutral-400" />,
      label: '不支援',
      color: 'text-neutral-500',
    };
  }

  switch (permission) {
    case 'granted':
      return {
        icon: <BellRing className="w-5 h-5 text-green-500" />,
        label: '已開啟',
        color: 'text-green-600',
      };
    case 'denied':
      return {
        icon: <BellOff className="w-5 h-5 text-red-500" />,
        label: '已關閉',
        color: 'text-red-600',
      };
    default:
      return {
        icon: <Bell className="w-5 h-5 text-amber-500" />,
        label: '尚未設定',
        color: 'text-amber-600',
      };
  }
};

const OtherSettingsList = () => {
  const { permission, isSupported, requestPermission, isLoading } =
    useFCMContext();

  const permissionDisplay = getPermissionDisplay(permission, isSupported);

  const items = [
    { label: '問題與幫助', path: '/settings/help' },
    { label: '回報問題', path: '/settings/report' },
    { label: '使用說明', path: '/settings/guide' },
  ];

  const handleNotificationClick = async () => {
    if (permission === 'denied') {
      // 已被拒絕，引導用戶手動開啟
      alert(
        '您已關閉通知權限。\n\n請至瀏覽器設定 > 網站設定 > 通知，手動開啟此網站的通知權限。',
      );
      return;
    }

    if (permission === 'default') {
      // 尚未請求，發起權限請求
      await requestPermission();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-primary-500 rounded-full" />
        <h3 className="text-lg font-bold text-neutral-800">其他</h3>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100">
        {/* 通知權限狀態 */}
        <button
          onClick={handleNotificationClick}
          disabled={isLoading || permission === 'granted'}
          className="flex items-center justify-between py-4 hover:bg-neutral-50 transition-colors -mx-6 px-6 w-full text-left disabled:cursor-default"
        >
          <div className="flex items-center gap-3">
            {permissionDisplay.icon}
            <span className="text-base font-medium text-neutral-800">
              推播通知
            </span>
          </div>
          <span className={`text-sm font-medium ${permissionDisplay.color}`}>
            {isLoading ? '處理中...' : permissionDisplay.label}
          </span>
        </button>

        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center justify-between py-4 hover:bg-neutral-50 transition-colors -mx-6 px-6"
          >
            <span className="text-base font-medium text-neutral-800">
              {item.label}
            </span>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </Link>
        ))}

        <div className="py-4 flex items-center justify-between -mx-6 px-6">
          <span className="text-base font-medium text-neutral-800">版本</span>
          <span className="text-sm font-medium text-neutral-500">
            FuFood 1.1
          </span>
        </div>
      </div>
    </div>
  );
};

export default OtherSettingsList;
