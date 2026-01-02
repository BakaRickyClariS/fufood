import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationKeys, useNotificationsQuery } from '../api/queries';

type UseNotificationPollingOptions = {
  /** 輪詢間隔（毫秒），預設 30 秒 */
  interval?: number;
  /** 是否啟用輪詢 */
  enabled?: boolean;
};

/**
 * In-App 通知輪詢 Hook
 *
 * 當 App 在前景時，每隔固定時間檢查新通知，
 * 並以 Toast 方式顯示新收到的通知。
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
  const lastNotificationIdRef = useRef<string | null>(null);

  // 取得通知列表
  const { data } = useNotificationsQuery();

  // 記錄最新的通知 ID，用於檢測新通知
  useEffect(() => {
    if (data?.data?.items?.[0]?.id && !lastNotificationIdRef.current) {
      lastNotificationIdRef.current = data.data.items[0].id;
    }
  }, [data?.data?.items]);

  const refetchNotifications = useCallback(async () => {
    // 刷新通知列表
    await queryClient.invalidateQueries({
      queryKey: notificationKeys.lists(),
    });
  }, [queryClient]);

  // 檢查是否有新通知並顯示 Toast
  const checkAndShowNewNotifications = useCallback(() => {
    const items = data?.data?.items;
    if (!items || items.length === 0) return;

    const latestId = items[0].id;

    // 如果有新通知（ID 不同且未讀）
    if (
      lastNotificationIdRef.current &&
      latestId !== lastNotificationIdRef.current
    ) {
      // 找出所有新的未讀通知
      const newNotifications = items.filter(
        (n) =>
          !n.isRead &&
          new Date(n.createdAt) >
            new Date(
              items.find((i) => i.id === lastNotificationIdRef.current)
                ?.createdAt || 0,
            ),
      );

      // 顯示 Toast（最多顯示 3 個）
      newNotifications.slice(0, 3).forEach((notification) => {
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      });

      console.log(
        `[NotificationPolling] 🔔 發現 ${newNotifications.length} 個新通知`,
      );
    }

    // 更新最後的通知 ID
    lastNotificationIdRef.current = latestId;
  }, [data?.data?.items]);

  // 當資料更新時檢查新通知
  useEffect(() => {
    if (enabled && data?.data?.items) {
      checkAndShowNewNotifications();
    }
  }, [enabled, data?.data?.items, checkAndShowNewNotifications]);

  // 定時輪詢
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('[NotificationPolling] 📱 啟用 In-App 輪詢通知');

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
