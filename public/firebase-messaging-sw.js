// public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js',
);

// ⚠️ 重要：PWA Service Worker 無法直接讀取 .env 環境變數
// 您必須在此處填入與 src/lib/firebase.ts 相同的 Firebase Config
// 在正式部署流程中，建議使用 CI/CD 或 build script 將變數注入此檔案
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // 請替換
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // 背景接收訊息處理
  messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] 收到背景訊息: ', payload);

    // 自訂通知內容
    const notificationTitle = payload.notification.title || 'Fufood 通知';
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/pwa-192x192.png', // 使用 PWA icon
      badge: '/pwa-64x64.png',
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('Firebase messaging SW initialization failed:', error);
}
