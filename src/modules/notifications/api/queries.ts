/**
 * Notifications TanStack Query Hooks
 *
 * 提供通知模組的快取和狀態管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identity } from '@/shared/utils/identity';
import { notificationsApi } from './client';
import type { GetNotificationsRequest, NotificationCategory } from '../types';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: GetNotificationsRequest) =>
    [...notificationKeys.lists(), params] as const,
  byCategory: (category: NotificationCategory) =>
    [...notificationKeys.lists(), { category }] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
};

/**
 * 批次刪除通知 Mutation
 */
export const useDeleteNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationsApi.deleteNotifications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

/**
 * 批次標記已讀 Mutation
 */
export const useMarkAsReadBatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, isRead }: { ids: string[]; isRead: boolean }) =>
      notificationsApi.markAsReadBatch(ids, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

/**
 * 取得通知列表
 */
export const useNotificationsQuery = (params?: GetNotificationsRequest) => {
  // 使用共用模組檢查是否可以發送認證請求
  const shouldQuery = identity.canMakeAuthenticatedRequest();

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: shouldQuery,
    staleTime: 1000 * 60 * 2, // 2 分鐘
  });
};

/**
 * 依分類取得通知
 */
export const useNotificationsByCategoryQuery = (
  category: NotificationCategory,
) => {
  return useQuery({
    queryKey: notificationKeys.byCategory(category),
    queryFn: () => notificationsApi.getNotifications({ category }),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * 取得通知設定
 */
export const useNotificationSettingsQuery = () => {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: () => notificationsApi.getSettings(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 標記已讀 Mutation
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      notificationsApi.markAsReadBatch([id], isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error) => {
      console.warn('[Notification] Failed to mark as read:', error);
    },
  });
};

/**
 * 刪除通知 Mutation
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotifications([id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

/**
 * 更新設定 Mutation
 */
export const useUpdateNotificationSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() });
    },
  });
};

/**
 * @deprecated 文件已恢復此端點，但建議優先使用後端自動觸發。
 */
export const useSendNotificationMutation = () => {
  return useMutation({
    mutationFn: (data: any) => notificationsApi.sendNotification(data),
  });
};

/**
 * @deprecated 文件已移除單筆查詢，請由列表取得。
 */
export const useNotificationQuery = (id: string) => {
  return useQuery({
    queryKey: ['notifications', 'detail', id],
    queryFn: async () => {
      console.warn(
        '⚠️ [API Correction] useNotificationQuery is deprecated.',
        id,
      );
      return { success: false };
    },
    enabled: false,
  });
};

/**
 * @deprecated 文件已移除此功能。
 */
export const useReadAllMutation = () => {
  return useMutation({
    mutationFn: async () => {
      console.warn('⚠️ [API Correction] useReadAllMutation is deprecated.');
      return { success: true };
    },
  });
};
