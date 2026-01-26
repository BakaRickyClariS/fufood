# PWA 推播通知後端整合規劃書

> 前端已完成 FCM Token 取得與自動註冊邏輯，需後端配合實作以下 API 與功能。

---

## ⚠️ 重要：目前問題說明

> [!CAUTION]
> **前端測試按鈕可以彈出通知，但入庫/消耗等操作沒有背景推播！**
>
> 原因：`POST /api/v1/notifications/send` 目前只將通知存入資料庫，**沒有呼叫 FCM 發送推播**。
>
> **解法**：後端在處理 `/notifications/send` 時，需要**同時**呼叫 Firebase Admin SDK 發送 FCM 推播。

---

## 📋 需求概覽

| 功能                   | 優先級      | 說明                                      | 目前狀態      |
| ---------------------- | ----------- | ----------------------------------------- | ------------- |
| FCM Token 註冊 API     | 🔴 必要     | 前端取得 Token 後註冊到後端               | ✅ 已完成     |
| FCM Token 管理         | 🔴 必要     | 儲存、更新、刪除使用者的裝置 Token        | ✅ 已完成     |
| **通知發送時觸發 FCM** | 🔴 **必要** | `POST /notifications/send` 需同時發送 FCM | ⚠️ **待確認** |
| 自動推播觸發           | 🟡 建議     | 在特定事件（入庫、過期等）時自動發送推播  | ✅ 已完成     |

---

## 🔧 API 規格

### 1. 註冊 FCM Token ✅

前端會在使用者同意通知權限後，自動呼叫此 API 註冊裝置 Token。

```http
POST /api/v1/notifications/token
```

**Headers:**

```
Content-Type: application/json
X-User-Id: {userId}
```

**Request Body:**

```json
{
  "fcmToken": "fMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...",
  "platform": "web" | "ios" | "android"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

---

### 2. 刪除 FCM Token（登出時）✅

```http
DELETE /api/v1/notifications/token
```

**Headers:**

```
Content-Type: application/json
X-User-Id: {userId}
```

**Request Body:**

```json
{
  "fcmToken": "fMxxxxxxxx..."
}
```

---

### 3. 發送通知 ⚠️ **此 API 需要同時觸發 FCM！**

> [!IMPORTANT]
> 這是目前的關鍵問題！前端呼叫此 API 時，後端需要：
>
> 1. 將通知存入 `notifications` 資料表
> 2. **同時呼叫 Firebase Admin SDK 發送 FCM 推播**

```http
POST /api/v1/notifications/send
```

**Request Body:**

```json
{
  "userIds": ["user-id-1", "user-id-2"],
  "groupId": "group-id",
  "title": "食材即將過期",
  "body": "您的牛奶將在 2 天後過期",
  "type": "expiry" | "inventory" | "shopping" | "recipe" | "system",
  "data": {
    "itemId": "inventory-item-id",
    "url": "/inventory/item/123"
  }
}
```

**後端邏輯（建議流程）：**

```typescript
// POST /api/v1/notifications/send 處理函式
async function handleSendNotification(req, res) {
  const { userIds, groupId, title, body, type, data } = req.body;

  // 1. 決定目標使用者
  let targetUserIds = userIds || [];
  if (groupId) {
    const groupMembers = await getGroupMembers(groupId);
    targetUserIds = groupMembers.map((m) => m.userId);
  }

  // 2. 將通知存入資料庫
  const notification = await db.notifications.create({
    title,
    body,
    type,
    data,
    targetUserIds,
    createdAt: new Date(),
  });

  // 3. ⭐ 同時發送 FCM 推播（這是目前缺少的！）
  const tokens = await db.fcmTokens.findAll({
    where: { userId: { in: targetUserIds } },
  });

  if (tokens.length > 0) {
    const fcmTokens = tokens.map((t) => t.token);

    const result = await messaging.sendEachForMulticast({
      notification: { title, body },
      data: { type, ...data },
      tokens: fcmTokens,
    });

    // 4. 清理失效的 Token
    result.responses.forEach((resp, idx) => {
      if (
        !resp.success &&
        resp.error?.code === 'messaging/registration-token-not-registered'
      ) {
        db.fcmTokens.delete({ where: { token: fcmTokens[idx] } });
      }
    });
  }

  return res.json({ success: true, notificationId: notification.id });
}
```

---

## 🗃️ 資料庫 Schema

### `fcm_tokens` 表 ✅

```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_token ON fcm_tokens(token);
```

---

## 🔌 Firebase Admin SDK 整合

### 安裝

```bash
npm install firebase-admin
```

### 初始化

```typescript
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}',
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const messaging = admin.messaging();
```

### 發送推播函式

```typescript
export async function sendPushNotifications({
  tokens,
  title,
  body,
  data = {},
}: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  if (tokens.length === 0) return { successCount: 0, failedTokens: [] };

  try {
    const response = await messaging.sendEachForMulticast({
      notification: { title, body },
      data,
      tokens,
    });

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    return { successCount: response.successCount, failedTokens };
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
}
```

---

## 🔄 自動推播觸發點

| 事件             | 觸發時機         | 通知內容範例                       |
| ---------------- | ---------------- | ---------------------------------- |
| **食材入庫**     | 群組成員入庫食材 | 「小明 新增了 牛奶 到冰箱」        |
| **食材即將過期** | 每日排程檢查     | 「您有 3 項食材即將在 3 天內過期」 |
| **食材已過期**   | 每日排程檢查     | 「您的 雞蛋 已過期」               |
| **購物清單更新** | 群組成員新增項目 | 「小美 新增了 3 項購物清單」       |
| **AI 食譜產生**  | 食譜生成完成     | 「您的 AI 食譜已產生：番茄炒蛋」   |
| **群組加入**     | 新成員加入群組   | 「小華 已加入您的群組」            |

---

## 🔐 環境變數

```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"fufood-f19bb",...}
```

> **如何取得：**
> Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰

---

## ✅ 後端實作檢查清單

- [x] 建立 `fcm_tokens` 資料表
- [x] 實作 `POST /api/v1/notifications/token` - 註冊 Token
- [x] 實作 `DELETE /api/v1/notifications/token` - 刪除 Token
- [x] 設定 Firebase Admin SDK
- [x] 設定 `FIREBASE_SERVICE_ACCOUNT_KEY` 環境變數
- [x] 在「入庫」API 中整合推播觸發
- [x] 設定每日排程檢查過期食材
- [x] 處理無效 Token 自動清理
- [ ] ⚠️ **確認 `POST /notifications/send` 有同時呼叫 FCM**

---

## 📞 前端已實作項目

| 項目            | 檔案                                   | 說明                       |
| --------------- | -------------------------------------- | -------------------------- |
| FCM Hook        | `src/hooks/useFCM.ts`                  | 管理 Token、權限、前景訊息 |
| FCM Provider    | `src/shared/providers/FCMProvider.tsx` | 全域 Context               |
| Service Worker  | `src/sw.ts`                            | 處理背景推播               |
| Firebase 初始化 | `src/lib/firebase.ts`                  | Firebase Messaging SDK     |
| 登出 Token 清理 | `src/routes/Settings/SettingsPage.tsx` | 登出時刪除 Token           |

前端會在使用者登入後自動請求通知權限，並將取得的 FCM Token 透過 `POST /api/v1/notifications/token` 註冊到後端。

---

## 📝 補充說明

### 為什麼測試按鈕有效但 API 沒效？

| 方式        | 原理                                                         | 需要後端？          |
| ----------- | ------------------------------------------------------------ | ------------------- |
| 測試按鈕    | `registration.showNotification()` 直接由 Service Worker 觸發 | ❌ 不需要           |
| 入庫/消耗等 | 呼叫 `POST /notifications/send` 由後端處理                   | ✅ 需要後端呼叫 FCM |

### Token 過期處理

FCM Token 可能因使用者清除瀏覽器資料或久未使用而失效，後端在發送推播時若收到 `messaging/registration-token-not-registered` 錯誤，應自動刪除該 Token。

### 多裝置支援

一個使用者可能有多個裝置（手機、電腦），因此 `fcm_tokens` 表是一對多關係。

### iOS 限制

iOS Safari 僅在 PWA 安裝到主畫面後才支援推播，且需 iOS 16.4 以上版本。

---

_文件更新時間：2026-01-02_
