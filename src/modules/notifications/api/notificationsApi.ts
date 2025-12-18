import { backendApi } from '@/api/client';

export type NotificationSettings = {
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  daysBeforeExpiry: number;
};

export const notificationsApi = {
  getSettings: () =>
    backendApi.get<NotificationSettings>('/api/v1/notifications'),
  updateSettings: (data: Partial<NotificationSettings>) =>
    backendApi.post<void>('/api/v1/notifications', data),
};
