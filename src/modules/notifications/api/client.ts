/**
 * Notification API Client Instance
 *
 * 為了避免 index.ts 和 queries.ts 之間的循環依賴，
 * 我們將 API 實例的建立與匯出移至此檔案。
 */
import type { NotificationsApi } from './notificationsApi';
import { notificationsMockApi } from './mock/notificationsMockApi';
import { notificationsApiImpl } from './notificationsApiImpl';

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

export const notificationsApi: NotificationsApi = useMockApi
  ? notificationsMockApi
  : notificationsApiImpl;
