/**
 * 通知 API 匯出
 *
 * 根據環境變數切換 Mock/Real API
 */
import type { NotificationsApi } from './notificationsApi';
import { notificationsMockApi } from './mock/notificationsMockApi';

// TODO: 實作真實 API 時取消註解
import { notificationsApiImpl } from './notificationsApiImpl';

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

export const notificationsApi: NotificationsApi = useMockApi
  ? notificationsMockApi
  : notificationsApiImpl;

export * from './notificationsApi';
export * from './queries';
