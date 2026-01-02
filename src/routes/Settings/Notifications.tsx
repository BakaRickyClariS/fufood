import { useNavigate } from 'react-router-dom';
import ComponentHeader from '@/modules/settings/components/SimpleHeader';
import { Switch } from '@/shared/components/ui/switch';
import {
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from '@/modules/notifications/api/queries';
import { useFCMContext } from '@/shared/providers/FCMProvider';
import type { NotificationSettings } from '@/modules/notifications/types';
import { useEffect, useState } from 'react';

type SettingItem = {
  id: keyof NotificationSettings;
  label: string;
  description: string;
};

const SETTING_ITEMS: SettingItem[] = [
  {
    id: 'notifyPush',
    label: '推播通知',
    description: '接收應用程式的即時推播訊息',
  },
  {
    id: 'notifyMarketing',
    label: '優惠與活動',
    description: '接收最新優惠與活動資訊',
  },
  {
    id: 'notifyExpiry',
    label: '即將過期提醒',
    description: '當食材即將過期時傳送提醒',
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const { data: response, isLoading } = useNotificationSettingsQuery();
  const updateSettings = useUpdateNotificationSettingsMutation();
  // 根據 Code Review 建議，改用 useFCMContext 統一 FCM 來源
  const { permission, requestPermission } = useFCMContext();
  const [localSettings, setLocalSettings] = useState<
    Partial<NotificationSettings>
  >({});

  // Sync server data to local state
  useEffect(() => {
    // API 回傳格式: { success: boolean, data: NotificationSettings }
    const settings = response?.data;
    if (settings) {
      setLocalSettings(settings);
    }
  }, [response]);

  const handleToggle = async (
    id: keyof NotificationSettings,
    currentVal: boolean,
  ) => {
    const nextVal = !currentVal;

    // 特殊邏輯：當開啟「推播通知」時
    if (id === 'notifyPush' && nextVal === true) {
      if (permission !== 'granted') {
        // 改用 requestPermission 並根據回傳值判斷
        const token = await requestPermission();
        // 若使用者拒絕或失敗（token 為 null），則不更新開關
        if (!token) return;
      }
    }

    // 樂觀更新 UI
    setLocalSettings((prev) => ({ ...prev, [id]: nextVal }));

    // 更新後端
    updateSettings.mutate(
      { [id]: nextVal },
      {
        onError: () => {
          // 失敗復原
          setLocalSettings((prev) => ({ ...prev, [id]: currentVal }));
        },
      },
    );
  };

  const settings = localSettings as NotificationSettings;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ComponentHeader title="推播通知" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : (
            SETTING_ITEMS.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between ${
                  index !== SETTING_ITEMS.length - 1
                    ? 'border-b border-neutral-100'
                    : ''
                }`}
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-neutral-800">{item.label}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={!!settings?.[item.id]}
                  onCheckedChange={() =>
                    handleToggle(item.id, !!settings?.[item.id])
                  }
                />
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-neutral-400 px-2 leading-relaxed">
          注意：您可能需要在手機系統設定中允許 FuFood
          發送通知，以上設定才會生效。
        </p>
      </div>
    </div>
  );
};

export default Notifications;
