# Profile API 使用指南

本文件描述使用者個人資料相關的 API 端點。

---

## 📋 API 總覽

| 方法   | 端點                          | 說明             | 需要認證 |
| ------ | ---------------------------- | ---------------- | -------- |
| GET    | `/api/v1/profile`            | 取得當前使用者資料 | ✅        |
| PUT    | `/api/v1/profile/{userId}`   | 更新使用者資料    | ✅        |

---

## 🔐 認證要求

所有 Profile API 都需要在 Request Header 中帶入認證資訊。請確保使用者已完成登入流程。

---

## 1️⃣ 取得當前使用者資料

### Request

```http
GET /api/v1/profile
```

### Response

```json
{
  "data": {
    "id": "019409ab-1234-7abc-8def-567890abcdef",
    "lineId": "U1234567890abcdef",
    "name": "王小明",
    "profilePictureUrl": "https://example.com/avatar.jpg",
    "email": "user@example.com",
    "preference": ["素食", "低熱量"],
    "gender": 0,
    "customGender": null,
    "subscriptionTier": 0,
    "createdAt": "2024-12-01T08:00:00Z",
    "updatedAt": "2024-12-30T10:30:00Z"
  }
}
```

### Response 欄位說明

| 欄位               | 型別       | 說明                                     |
| ------------------ | ---------- | ---------------------------------------- |
| `id`               | string     | 使用者 UUID (v7)                         |
| `lineId`           | string     | LINE 使用者 ID                           |
| `name`             | string     | 使用者名稱                               |
| `profilePictureUrl`| string?    | 使用者頭像 URL                           |
| `email`            | string?    | 電子郵件                                 |
| `preference`       | string[]?  | 飲食偏好標籤                             |
| `gender`           | int        | 性別 (見下方列舉)                        |
| `customGender`     | string?    | 自訂性別 (當 `gender` = 4 時使用)        |
| `subscriptionTier` | int        | 訂閱等級 (0: Free)                       |
| `createdAt`        | string     | 建立時間 (ISO 8601)                      |
| `updatedAt`        | string     | 更新時間 (ISO 8601)                      |

---

## 2️⃣ 更新使用者資料

### Request

```http
PUT /api/v1/profile/{userId}
Content-Type: application/json
```

### Path Parameters

| 參數     | 型別 | 必填 | 說明        |
| -------- | ---- | ---- | ----------- |
| `userId` | GUID | ✅   | 使用者 UUID |

### Request Body

```json
{
  "name": "新名稱",
  "profilePictureUrl": "https://example.com/new-avatar.jpg",
  "email": "newemail@example.com",
  "preference": ["素食", "無麩質"],
  "gender": 1,
  "customGender": null
}
```

### Request Body 欄位說明

| 欄位               | 型別       | 必填 | 說明                                     |
| ------------------ | ---------- | ---- | ---------------------------------------- |
| `name`             | string     | ✅   | 使用者名稱                               |
| `profilePictureUrl`| string     | ❌   | 使用者頭像 URL                           |
| `email`            | string     | ❌   | 電子郵件                                 |
| `preference`       | string[]   | ❌   | 飲食偏好標籤陣列                         |
| `gender`           | int        | ❌   | 性別 (預設: 0，見下方列舉)               |
| `customGender`     | string     | ❌   | 自訂性別文字 (當 gender = 4 時填寫)      |

### Response

```json
{
  "data": {
    "id": "019409ab-1234-7abc-8def-567890abcdef",
    "lineId": "U1234567890abcdef",
    "name": "新名稱",
    "profilePictureUrl": "https://example.com/new-avatar.jpg",
    "email": "newemail@example.com",
    "preference": ["素食", "無麩質"],
    "gender": 1,
    "customGender": null,
    "subscriptionTier": 0,
    "createdAt": "2024-12-01T08:00:00Z",
    "updatedAt": "2024-12-31T16:00:00Z"
  }
}
```

---

## 📊 列舉型別

### Gender (性別)

| 值  | 名稱          | 說明     |
| --- | ------------- | -------- |
| 0   | NotSpecified  | 不透露   |
| 1   | Female        | 女孩兒   |
| 2   | Male          | 男孩紙   |
| 3   | NonBinary     | 無性別   |
| 4   | Other         | 其他     |

> [!TIP]
> 當 `gender` 設為 **4 (Other)** 時，可使用 `customGender` 欄位填寫自訂性別文字，最長 10 字元。

---

## 💡 前端整合範例

### 取得個人資料

```javascript
const response = await fetch('/api/v1/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data: user } = await response.json();
console.log(user.name);
```

### 更新個人資料

```javascript
const response = await fetch(`/api/v1/profile/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: '新使用者名稱',
    email: 'newemail@example.com',
    preference: ['素食', '低卡'],
    gender: 1
  })
});

const { data: updatedUser } = await response.json();
```

---

## ⚠️ 注意事項

1. **PUT 請求**: `userId` 必須與當前登入使用者的 ID 相同，否則無法更新
2. **name 欄位**: 為必填欄位，長度限制 255 字元
3. **preference**: 陣列格式，可儲存多個飲食偏好標籤
4. **profilePictureUrl**: 需為有效的 URL 格式，長度限制 255 字元
