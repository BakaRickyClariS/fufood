import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComponentHeader from '@/modules/settings/components/SimpleHeader';
import { Switch } from '@/shared/components/ui/switch'; // Will need to check if Switch component exists

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const MOCK_SETTINGS: NotificationSetting[] = [
  {
    id: 'push',
    label: '推播通知',
    description: '接收應用程式的即時推播訊息',
    enabled: true,
  },
  {
    id: 'marketing',
    label: '優惠與活動',
    description: '接收最新優惠與活動資訊',
    enabled: false,
  },
  {
    id: 'expiry',
    label: '即將過期提醒',
    description: '當食材即將過期時傳送提醒',
    enabled: true,
  }
];

const Notifications = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(MOCK_SETTINGS);

  const handleToggle = (id: string) => {
    setSettings(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ComponentHeader title="推播通知" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {settings.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-4 flex items-center justify-between ${
                index !== settings.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-neutral-800">{item.label}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
              </div>
              <Switch 
                checked={item.enabled} 
                onCheckedChange={() => handleToggle(item.id)}
              />
            </div>
          ))}
        </div>
        
        <p className="text-xs text-neutral-400 px-2 leading-relaxed">
          注意：您可能需要在手機系統設定中允許 FuFood 發送通知，以上設定才會生效。
        </p>
      </div>
    </div>
  );
};

export default Notifications;
