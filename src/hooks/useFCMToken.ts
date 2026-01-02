import { useState, useCallback } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';
import { notificationService } from '@/api/services/notification';
import { toast } from 'sonner';

export function useFCMToken() {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );

  const enablePush = useCallback(async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // 同步 Token 到後端
        await notificationService.registerToken(token);
        setPermission('granted');
        toast.success('已啟用推播通知');
        return true;
      } else {
        // 使用者拒絕或失敗
        setPermission(Notification.permission);
        if (Notification.permission === 'denied') {
          toast.error('您已封鎖通知，請至瀏覽器設定開啟');
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to enable push:', error);
      toast.error('啟用失敗，請檢查瀏覽器設定');
      return false;
    }
  }, []);

  return { permission, enablePush };
}
