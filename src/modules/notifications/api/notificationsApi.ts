import { apiClient } from '@/lib/apiClient';

export type NotificationSettings = {
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  daysBeforeExpiry: number;
};

export const notificationsApi = {
  getSettings: () => apiClient.get<NotificationSettings>('/notifications'),
  updateSettings: (data: Partial<NotificationSettings>) => apiClient.post<void>('/notifications', data),
};
