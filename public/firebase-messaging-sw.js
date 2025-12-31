// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 這些設定值應該在部署時被替換，或是在 sw 中硬編碼 (因為 SW 不能直接讀取 .env)
// 為了避免硬編碼機密資訊，通常我們會建議在 build process 中注入，
// 但 Service Worker 的 context 比較特殊。
// 這裡暫時放置 placeholders，請使用者填入 Client SDK Config。
const firebaseConfig = {
  // ⚠️ 請填入您的 Firebase Client SDK 設定 (從 Firebase Console > Project Settings 取得)
  // 這不是 Service Account! 請不要貼上 private_key!
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('Firebase messaging SW initialization failed:', error);
}
