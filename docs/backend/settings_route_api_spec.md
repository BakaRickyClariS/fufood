# Settings Route API 規格文件

**版本**: v1.0  
**日期**: 2025-12-30  
**用途**: 定義 Settings 路由下各項功能所需的後端 API 規格

---

## 1. 概述

此文件涵蓋 App 中「設定 (Settings)」頁面及其子頁面的 API 需求，包含個人檔案管理、飲食喜好、訂閱方案、購買紀錄、通知設定與問題回報。

**Base Path**: `/api/v1`

---

## 2. 個人檔案與設定 (Profile & Preferences)

對應頁面：`/settings/profile`, `/settings/dietary-preference`

### 2.1 取得個人資料 (Get Profile)
*已存在，需確保留回傳完整欄位*

**GET** `/profile`

**Response**:
```typescript
{
  status: true,
  data: {
    id: string;
    email: string;
    name: string;
    avatar: string;         // URL
    phone: string;
    gender: "male" | "female" | "other" | "prefer-not-to-say";
    lineId?: string;        // 若有綁定
    dietaryPreference?: {
      cookingFrequency: string; // e.g. "3-4"
      prepTime: string;         // e.g. "15-30"
      seasoningLevel: string;   // e.g. "moderate"
      restrictions: string[];   // e.g. ["none", "low-sugar"]
    }
  }
}
```

### 2.2 更新個人資料 (Update Profile)

**PUT** `/profile` 
(前端目前實作路徑為 `/auth/update-profile`，建議統一為 `/profile`)

**Request Body**:
```typescript
{
  // 以下欄位皆為可選 (Partial Update)
  name?: string;
  phone?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  dietaryPreference?: {
    cookingFrequency?: string;
    prepTime?: string;
    seasoningLevel?: string;
    restrictions?: string[];
  }
}
```

**Response**:
```typescript
{
  status: true,
  message: "Profile updated successfully",
  data: {
    // 回傳更新後的完整 User 物件
  }
}
```

---

## 3. 通知設定 (Notifications)

對應頁面：`/settings/notifications`

### 3.1 取得通知設定

**GET** `/notifications/settings`

**Response**:
```typescript
{
  status: true,
  data: {
    settings: {
      push: boolean;        // App 推播總開關
      marketing: boolean;   // 行銷優惠通知
      expiry: boolean;      // 食材過期提醒
    }
  }
}
```

### 3.2 更新通知設定

**PUT** `/notifications/settings`

**Request Body**:
```typescript
{
  push?: boolean;
  marketing?: boolean;
  expiry?: boolean;
}
```

**Response**:
```typescript
{
  status: true,
  message: "Notification settings updated"
}
```

---

## 4. 訂閱與購買 (Subscription & Purchase)

對應頁面：`/settings/subscription`, `/settings/purchase-history`

### 4.1 取得訂閱方案列表

**GET** `/subscription/plans`

**Response**:
```typescript
{
  status: true,
  data: {
    plans: [
      {
        id: "free",
        name: "Free基礎入門",
        price: 0,
        currency: "TWD",
        period: "month",
        features: ["群組管理：3 個", "共享採買清單：5 筆", ...]
      },
      {
        id: "premium",
        name: "Pro專業家庭",
        price: 200,
        currency: "TWD",
        period: "month",
        features: ["群組管理：5 個", "共享採買清單：10 筆", ...]
      }
    ]
  }
}
```

### 4.2 取得購買紀錄

**GET** `/subscription/orders`

**Response**:
```typescript
{
  status: true,
  data: {
    orders: [
      {
        id: "ORD-20231201-001",
        date: "2023-12-01T10:00:00Z",
        itemName: "進階版會員 (月費)",
        amount: 90,
        currency: "TWD",
        status: "completed" | "pending" | "failed"
      }
    ]
  }
}
```

---

## 5. 客服與支援 (Support)

對應頁面：`/settings/report`

### 5.1 回報問題

**POST** `/support/reports`

**Request Body**:
```typescript
{
  type: "bug" | "suggestion" | "visual";
  description: string;
  deviceInfo?: string;   // 前端自動帶入的裝置資訊
  appVersion?: string;   // 前端自動帶入的版本號
  imageUrl?: string;     // 截圖 URL (需先呼叫上傳 API 取得)
}
```

**Response**:
```typescript
{
  status: true,
  message: "Report submitted successfully",
  data: {
    reportId: "RPT-123456"
  }
}
```

---

## 6. 其他 (Misc)

### 6.1 LINE 綁定狀態與操作
*已存在於 Auth 模組，此處列出以示完整*

- **GET** `/auth/line/status` - 檢查綁定狀態
- **POST** `/auth/line/bind` - 進行綁定 (通常透過 OAuth Flow)
- **POST** `/auth/line/unbind` - 解除綁定

