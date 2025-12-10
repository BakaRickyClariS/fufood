# Notifications Module API Specification

**版本**: v1.0  
**涵蓋範圍**: 使用者通知設定（過期/低庫存提醒等）

---

## 1. 基本規範
- Base URL: `/api/v1`
- 需帶 Access Token
- 成功/錯誤格式同 `auth_api_spec.md`

---

## 2. 資料模型

### 2.1 NotificationSettings
```typescript
type NotificationSettings = {
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  daysBeforeExpiry: number; // 幾天前提醒
};
```

---

## 3. Notifications API

### 3.1 取得通知設定
- **GET** `/api/v1/notifications`
- 200 → `NotificationSettings`

### 3.2 更新通知設定
- **POST** `/api/v1/notifications`
- Body: `Partial<NotificationSettings>`
- 200 → `{ success: true }` 或 204

---

## 4. 後續規劃
- 可增補通知管道（Email/LINE/Bot Push）選項。
- 可增補群組/個人化通知頻率設定。
