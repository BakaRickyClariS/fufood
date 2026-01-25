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
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
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
 * 取得單一通知
 */
export const useNotificationQuery = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getNotification(id),
    enabled: !!id,
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
      notificationsApi.markAsRead(id, { isRead }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error) => {
      // 靜默處理錯誤，不阻塞 UI 操作（如跳轉）
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
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

/**
 * 全部標記已讀 Mutation
 */
export const useReadAllMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.readAll(),
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
 * 發送通知 Mutation
 */
export const useSendNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.sendNotification,
    onSuccess: () => {
      // 發送成功後，強制刷新通知列表，讓使用者能看到剛發出的通知 (如果發給自己的話)
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};
