/**
 * 測試推播通知腳本
 * 用途: 模擬後端伺服器發送推播通知到前端
 * 使用方式:
 * 1. 確保您已在 .env.example 填寫或有 VAPID Key (此腳本不需要 VAPID，但需要 Service Account)
 * 2. 確定 service-account-file.json 存在於專案根目錄 (注意：這檔案只能在後端使用)
 * 3. 執行指令: node scripts/test-push.cjs <YOUR_DEVICE_TOKEN>
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../service-account-file.json');

// 1. 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 2. 取得指令參數中的 Device Token
const registrationToken = process.argv[2];

if (!registrationToken) {
  console.error('❌ 錯誤: 請提供 Device Token');
  console.log('使用範例: node scripts/test-push.cjs <YOUR_DEVICE_TOKEN>');
  console.log('提示: 您可以在前端 console 啟動時看到 "FCM Token: ..."');
  process.exit(1);
}

// 3. 準備訊息內容
const message = {
  notification: {
    title: 'Fufood 測試通知',
    body: '這是一則來自後端(測試腳本)的推播通知！',
  },
  // 可以在這裡放自訂資料
  data: {
    type: 'test_notification',
    timestamp: Date.now().toString(),
  },
  token: registrationToken,
};

// 4. 發送訊息
console.log('正在傳送訊息到:', registrationToken.substring(0, 10) + '...');

admin.messaging()
  .send(message)
  .then((response) => {
    console.log('✅ 成功發送訊息:', response);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 發送失敗:', error);
    process.exit(1);
  });
