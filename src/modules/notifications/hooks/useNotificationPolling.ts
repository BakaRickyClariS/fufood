import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '../api/queries';
import { isIOS } from '@/shared/utils/deviceUtils';

type UseNotificationPollingOptions = {
  /** 輪詢間隔（毫秒），預設 30 秒 */
  interval?: number;
  /** 是否啟用輪詢 */
  enabled?: boolean;
};

/**
 * iOS In-App 通知輪詢 Hook
 *
 * 在 iOS 上每隔固定時間自動刷新通知列表，
 * 作為不支援 FCM 背景推播的替代方案。
 *
 * @example
 * ```tsx
 * // 在需要輪詢的地方使用
 * useNotificationPolling({ enabled: isAuthenticated });
 * ```
 */
export const useNotificationPolling = ({
  interval = 30000,
  enabled = true,
}: UseNotificationPollingOptions = {}) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);

  const refetchNotifications = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: notificationKeys.lists(),
    });
  }, [queryClient]);

  useEffect(() => {
    // 只在 iOS 且 enabled 時啟用輪詢
    const shouldPoll = isIOS() && enabled;

    if (!shouldPoll) {
      // 清理既有的 interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('[NotificationPolling] 📱 iOS 偵測，啟用 In-App 輪詢');

    // 立即執行一次
    refetchNotifications();

    // 設定定時輪詢
    intervalRef.current = window.setInterval(() => {
      console.log('[NotificationPolling] 🔄 輪詢通知...');
      refetchNotifications();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, refetchNotifications]);

  return { refetchNotifications };
};

export default useNotificationPolling;
