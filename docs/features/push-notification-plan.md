# 推播功能實作規劃書 (Push Notification Implementation Plan)

本文件依據提供的聊天記錄，規劃前端推播功能的實作步驟。

## 1. 目標 (Objective)
在前端應用程式中實作推播通知功能，包括：
1. 建立並註冊 `firebase-messaging-sw.js` Service Worker。
2. 在前端應用程式中請求通知權限。
3. 取得 FCM Token 並準備傳送至後端。

## 2. 前置準備 (Prerequisites)

### 2.1 安裝 Firebase SDK
專案尚未安裝 `firebase` 套件，需執行以下指令安裝：
```bash
npm install firebase
```

### 2.2 準備 Firebase 設定 (Configuration)
前端需要 Firebase **Client SDK** 的設定檔，請至 Firebase Console > Project Settings > General > Your apps 取得。

> [!IMPORTANT]
> 聊天記錄中提供的 JSON (`type: "service_account"`) 是 **後端 Admin SDK** 使用的私鑰，**絕對不能** 暴露在前端程式碼中。
> 前端 `firebaseConfig` 應包含 `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` 等欄位。

## 3. 實作步驟 (Implementation Steps)

### 步驟 A: 建立 Service Worker

**檔案位置**: `public/firebase-messaging-sw.js`
> [!NOTE]
> 若專案根目錄無 `public` 資料夾，請先建立 `public` 資料夾。Vite 預設會將 `public` 中的檔案複製到根目錄，確保 Service Worker 能被正確存取 (例如: `https://your-domain.com/firebase-messaging-sw.js`)。

**程式碼內容**:
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

const firebaseConfig = {
  // TODO: 請填入您的 Client SDK Firebase Config
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // ...
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 背景接收訊息處理
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] 收到背景訊息: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // 建議更換為您的 App Icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 步驟 B: 前端權限請求與 Token 取得

建議建立一個專門的 Hook 或 Service 來處理 Firebase 初始化與邏輯。

**檔案位置**: `src/lib/firebase.ts` (建議新建)

```typescript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  // TODO: 請填入您的 Client SDK Firebase Config (建議讀取 .env)
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const VAPID_KEY = 'BBYdEg7RCJRwOmuOHH2QdyIY1OyTDEeONpSxoGA0gLfjogDud-Nw2jXJnrREYAD_QycjxBKlm07Dgl78rdiV4z4';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('取得裝置 Token:', token);
      return token;
    } else {
      console.log('使用者拒絕通知');
      return null;
    }
  } catch (error) {
    console.error('取得 Token 失敗:', error);
    return null;
  }
}
```

**整合至應用程式**:
在 `src/App.tsx` 或首頁元件中呼叫：

```typescript
import { useEffect } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';

// ... Inside Component
useEffect(() => {
  const initPushNotification = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      // TODO: 呼叫 API 將 Token 傳送至後端儲存
      // await updateDeviceToken(token);
    }
  };
  
  initPushNotification();
}, []);
```

## 4. 關鍵資訊整理 (Key Information)

### VAPID Key
聊天記錄提供的 VAPID Key:
`BBYdEg7RCJRwOmuOHH2QdyIY1OyTDEeONpSxoGA0gLfjogDud-Nw2jXJnrREYAD_QycjxBKlm07Dgl78rdiV4z4`

### Service Account (後端使用)
聊天記錄提供的 Service Account (部分資訊)，這 **不應** 用於上述前端程式碼，而是用於後端伺服器發送訊息：
- Project ID: `fufood-8da97`
- Client Email: `firebase-adminsdk-fbsvc@fufood-8da97.iam.gserviceaccount.com`

## 5. 後續建議
1. **安全性**: 將 Firebase Config 的數值放入 `.env` 檔案中，避免直接寫死在程式碼裡。
2. **圖示**: 記得在 `public` 資料夾中放入通知用的圖示檔案 (如 `firebase-logo.png` 或應用程式 Icon)。
3. **PWA 整合**: 目前專案已使用 `vite-plugin-pwa`，需確認 Service Worker 的註冊不會互相衝突。通常 `firebase-messaging-sw.js` 獨立運作即可，但若需進階整合可考慮將 Firebase 邏輯合併至目前的 SW 生成流程中。
