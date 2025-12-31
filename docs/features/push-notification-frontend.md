# 前端推播功能完整實作規劃書 (Frontend Implementation Plan)

本文件整合了 **基礎環境設定**、**API 實作** 以及 **UI 頁面整合** 的所有細節。

## 1. 基礎環境設定 (Infrastructure)

### 步驟 A: 檢查 Service Worker
確認 `public/firebase-messaging-sw.js` 已建立，且包含正確的 **Client Config**。
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "...", // 務必填寫您的 Client Config
  // ... 其他欄位
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // 自訂背景通知顯示邏輯
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 步驟 B: Firebase 初始化與權限請求
確認 `src/lib/firebase.ts` 已實作。
```typescript
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... 其他從 .env 讀取的欄位
};

// ... 初始化邏輯

export async function requestNotificationPermission() {
  // 請求權限並回傳 FCM Token
  // ...
}
```

## 2. API 服務層 (Service Layer)

### 步驟 C: 建立 Notification API Service
在 `src/api/services/notification.ts` (或合併入 `src/modules/notifications/api/notificationsApi.ts`)。

```typescript
import { backendApi } from '@/api/client';

export interface RegisterTokenRequest {
  fcmToken: string;
  deviceType?: 'web' | 'android' | 'ios';
}

export const notificationService = {
  // 1. 註冊 Token
  registerToken: async (token: string) => {
    return backendApi.post<void>('/api/v1/notifications/token', {
      fcmToken: token,
      deviceType: 'web',
    });
  },

  // 2. 更新通知設定 (供 Settings 頁面使用)
  updateSettings: async (settings: Record<string, boolean>) => {
    return backendApi.patch('/api/v1/notifications/settings', settings);
  },

  // 3. 取得通知列表 (供 NotificationsPage 使用)
  getNotifications: async (params?: any) => {
    return backendApi.get('/api/v1/notifications', { params });
  }
};
```

## 3. 邏輯封裝 (Hooks)

### 步驟 D: 建立 `useFCMToken` Hook
建立 `src/hooks/useFCMToken.ts` 封裝權限請求與自動同步邏輯。

```typescript
// src/hooks/useFCMToken.ts
import { useState, useCallback } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';
import { notificationService } from '@/api/services/notification';
import { toast } from 'sonner';

export function useFCMToken() {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );

  const enablePush = useCallback(async () => {
    try {
      // 1. 請求瀏覽器權限
      const token = await requestNotificationPermission();
      if (token) {
        // 2. 拿到 Token 後同步給後端
        await notificationService.registerToken(token);
        setPermission('granted');
        toast.success('已啟用推播通知');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to enable push:', error);
      toast.error('啟用失敗，請檢查瀏覽器設定');
      return false;
    }
  }, []);

  return { permission, enablePush };
}
```

## 4. UI 頁面整合 (UI Integration)

### 步驟 E: 設定頁面 (`src/routes/Settings/Notifications.tsx`)
將原本的 Mock Data 邏輯替換為真實 API 操作。

```typescript
// src/routes/Settings/Notifications.tsx
import { useNotificationsSettingsQuery, useUpdateSettingsMutation } from '@/modules/notifications/api';
import { useFCMToken } from '@/hooks/useFCMToken';
import { Switch } from '@/shared/components/ui/switch';

const Notifications = () => {
  // 1. 從後端取得目前設定
  const { data: settingsData, isLoading } = useNotificationsSettingsQuery();
  // 2. 更新設定的 Mutation
  const updateSettings = useUpdateSettingsMutation();
  // 3. FCM 權限控制 Hook
  const { permission, enablePush } = useFCMToken();

  const handleToggle = async (id: string, currentVal: boolean) => {
    const nextVal = !currentVal;

    // 特殊邏輯：如果是開啟推播開關 (push_enabled)
    if (id === 'push_enabled' && nextVal === true) {
       // 檢查瀏覽器權限，若未授權則請求
       if (permission !== 'granted') {
         const success = await enablePush();
         if (!success) {
           // 使用者拒絕授權，中斷開關切換
           return; 
         }
       }
    }

    // 呼叫 API 更新後端
    updateSettings.mutate({ [id]: nextVal });
  };

  if (isLoading) return <div>Loading...</div>;

  // Render ...
  // 使用 settingsData 來渲染列表，並在 Switch 的 onCheckedChange 呼叫 handleToggle
};
```

### 步驟 F: 通知列表頁面 (`src/routes/Notifications/NotificationsPage.tsx`)
確認該頁面使用的 `useNotificationsByCategoryQuery` 是否已串接真實 API。
- 檢查 `src/modules/notifications/api/queries.ts` 中的實作。
- 若專案設定為 `VITE_USE_MOCK_API=false`，應確保 `notificationService.getNotifications` 會被呼叫。

## 5. 開發檢查清單 (Checklist)
- [ ] **基礎**: `firebase-messaging-sw.js` 設定正確 (Client Config)。
- [ ] **基礎**: `.env` 設定正確 (VAPID Key)。
- [ ] **API**: `notification.ts` 完成 `registerToken` 等方法。
- [ ] **Hook**: `useFCMToken.ts` 完成。
- [ ] **UI**: `Settings/Notifications.tsx` 整合完畢，能觸發權限請求。
- [ ] **驗證**: 開啟開關 -> 允許權限 -> Console 顯示 Token -> API 呼叫成功。
