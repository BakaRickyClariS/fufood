import { Switch } from '@/shared/components/ui/switch';
import { useFCMContext } from '@/shared/providers/FCMProvider';
import { useCameraPermission } from '@/hooks/useCameraPermission';

const PermissionSettings = () => {
  // FCM Logic
  const {
    isRegistered,
    requestPermission,
    unregisterToken,
    isLoading: isFCMLoading,
    permission: fcmPermission,
  } = useFCMContext();

  const handleNotificationChange = async (checked: boolean) => {
    if (checked) {
      if (fcmPermission === 'denied') {
        alert('您已關閉通知權限。請至瀏覽器設定手動開啟。');
        return;
      }
      await requestPermission();
    } else {
      await unregisterToken();
    }
  };

  // Camera Logic
  const {
    permission: cameraPermission,
    requestPermission: requestCamera,
    isLoading: isCameraLoading,
  } = useCameraPermission();

  const handleCameraChange = async (checked: boolean) => {
    if (checked) {
      if (cameraPermission === 'denied') {
        alert('您已關閉相機權限。請至瀏覽器設定手動開啟。');
        return;
      }
      await requestCamera();
    } else {
      alert('請至瀏覽器設定中手動關閉相機權限。此設定無法透過網站直接關閉。');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-primary-500 rounded-full" />
        <span className="text-base font-semibold text-neutral-800">權限設定</span>
      </div>

      <div className="space-y-6">
        {/* Push Notification */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-neutral-800">
            推播通知
          </span>
          <Switch
            checked={isRegistered}
            onCheckedChange={handleNotificationChange}
            disabled={isFCMLoading}
          />
        </div>

        {/* Camera Permission */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-neutral-800">
            相機權限
          </span>
          <Switch
            checked={cameraPermission === 'granted'}
            onCheckedChange={handleCameraChange}
            disabled={isCameraLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PermissionSettings;
