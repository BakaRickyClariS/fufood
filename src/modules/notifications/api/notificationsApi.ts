import { apiClient } from '@/lib/apiClient';

export type NotificationSettings = {
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  daysBeforeExpiry: number;
};

export const notificationsApi = {
  getSettings: () =>
    apiClient.get<NotificationSettings>('/api/v1/notifications'),
  updateSettings: (data: Partial<NotificationSettings>) =>
    apiClient.post<void>('/api/v1/notifications', data),
};
