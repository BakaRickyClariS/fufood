import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notificationKeys, useNotificationsQuery } from '../api/queries';
import { useAuth } from '@/modules/auth';
import type { NotificationMessage } from '../types';

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
 * 注意：本人觸發的通知不會顯示 Toast（但仍保留在通知列表）。
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
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);
  const { user } = useAuth();
  const currentUserId = user?.id;

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

  // 根據通知的 action 決定跳轉目的地
  const getNavigationPath = useCallback((notification: NotificationMessage): string | null => {
    const action = notification.action;
    if (!action) return '/notifications'; // 無 action 則跳轉到通知列表

    const payload = action.payload;
    switch (action.type) {
      case 'inventory':
        // 跳轉到庫存頁，如果有 refrigeratorId 可以帶參數
        if (payload?.refrigeratorId) {
          return `/inventory?fridgeId=${payload.refrigeratorId}`;
        }
        return '/inventory';
      case 'shopping-list':
        // 跳轉到購物清單
        if (payload?.listId) {
          return `/planning/list/${payload.listId}`;
        }
        return '/planning';
      case 'recipe':
        // 跳轉到食譜頁
        if (payload?.recipeId) {
          return `/recipes/${payload.recipeId}`;
        }
        return '/recipes';
      case 'group':
        // 跳轉到群組設定
        return '/settings/groups';
      case 'detail':
        // 跳轉到通知詳情
        return `/notifications/${notification.id}`;
      default:
        return '/notifications';
    }
  }, []);

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

      // 過濾掉本人觸發的通知（避免重複提示）
      const notificationsToShow = newNotifications.filter(
        (n) => !currentUserId || n.actorId !== currentUserId
      );

      // 顯示 Toast（最多顯示 3 個）
      notificationsToShow.slice(0, 3).forEach((notification) => {
        const path = getNavigationPath(notification);
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
          action: path ? {
            label: '查看',
            onClick: () => navigate(path),
          } : undefined,
        });
      });

      if (notificationsToShow.length > 0) {
        console.log(
          `[NotificationPolling] 🔔 顯示 ${notificationsToShow.length} 個新通知 (過濾本人操作 ${newNotifications.length - notificationsToShow.length} 個)`,
        );
      }
    }

    // 更新最後的通知 ID
    lastNotificationIdRef.current = latestId;
  }, [data?.data?.items, currentUserId, getNavigationPath, navigate]);

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
