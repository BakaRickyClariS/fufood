# 前端群組 API 欄位需求反饋

---

## 欄位總覽

### Group（群組）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `id` | string (UUID) | ✅ | `"550e8400-e29b-41d4-a716-446655440000"` | 群組唯一識別碼 |
| `name` | string | ✅ | `"哇欸冰箱"` | 群組名稱（1-50 字） |
| `admin` | string | ⚪ | `"Jocelyn"` | 管理員顯示名稱 |
| `imageUrl` | string (URL) | ⚪ | `"https://example.com/image.png"` | 群組圖片 URL |
| `plan` | enum | ⚪ | `"free"` or `"premium"` | 訂閱方案 |
| `members` | Member[] | ⚪ | 見下方 | 成員列表 |
| `createdAt` | string (ISO 8601) | ⚪ | `"2025-12-18T08:00:00.000Z"` | 建立時間 |
| `updatedAt` | string (ISO 8601) | ⚪ | `"2025-12-18T08:00:00.000Z"` | 更新時間 |

### Member（成員）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `id` | string (UUID) | ✅ | `"user-1"` | 成員唯一識別碼 |
| `name` | string | ✅ | `"Jocelyn"` | 成員顯示名稱 |
| `avatar` | string (URL) | ✅ | `"https://example.com/avatar.jpg"` | 頭像圖片 URL |
| `role` | enum | ✅ | `"owner"` or `"member"` | 角色（擁有者/成員） |

### CreateGroupForm（建立群組請求）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `name` | string | ✅ | `"我的冰箱"` | 群組名稱 |

### UpdateGroupForm（更新群組請求）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `name` | string | ⚪ | `"新的冰箱名稱"` | 群組名稱 |

### InviteMemberForm（邀請成員請求）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `email` | string | ✅ | `"member@example.com"` | 被邀請者 Email |
| `role` | enum | ⚪ | `"member"` | 角色（預設 member） |

### JoinGroupForm（加入群組請求）

| 欄位 | 類型 | 必填 | 範例 | 說明 |
|------|------|:----:|------|------|
| `inviteCode` | string | ✅ | `"ABC123"` | 邀請碼 |

---

## API 規格（按使用優先順序）

### 🔴 高優先：正在使用的 API

#### 1. 取得所有群組

```
GET /api/v1/refrigerators
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "哇欸冰箱",
    "imageUrl": "https://example.com/fridge.png",
    "admin": "Jocelyn",
    "plan": "free",
    "members": [
      {
        "id": "user-1",
        "name": "Jocelyn",
        "avatar": "https://example.com/jocelyn.jpg",
        "role": "owner"
      }
    ],
    "createdAt": "2025-12-18T08:00:00.000Z",
    "updatedAt": "2025-12-18T08:00:00.000Z"
  }
]
```

---

#### 2. 取得單一群組

```
GET /api/v1/refrigerators/:id
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "哇欸冰箱",
  "imageUrl": "https://example.com/fridge.png",
  "admin": "Jocelyn",
  "plan": "free",
  "members": [
    {
      "id": "user-1",
      "name": "Jocelyn",
      "avatar": "https://example.com/jocelyn.jpg",
      "role": "owner"
    }
  ],
  "createdAt": "2025-12-18T08:00:00.000Z",
  "updatedAt": "2025-12-18T08:00:00.000Z"
}
```

---

#### 3. 建立群組

```
POST /api/v1/refrigerators
```

**Request Body:**
```json
{
  "name": "我的冰箱"
}
```

**Response:** 回傳建立的群組物件（同上）

---

#### 4. 更新群組

```
PUT /api/v1/refrigerators/:id
```

**Request Body:**
```json
{
  "name": "新的冰箱名稱"
}
```

**Response:** 回傳更新後的群組物件

---

#### 5. 刪除群組

```
DELETE /api/v1/refrigerators/:id
```

**Response:** `204 No Content` 或 `{ "success": true }`

---

### 🟡 中優先：成員相關 API

#### 6. 取得群組成員

```
GET /api/v1/refrigerators/:id/members
```

**Response:**
```json
[
  {
    "id": "user-1",
    "name": "Jocelyn",
    "avatar": "https://example.com/jocelyn.jpg",
    "role": "owner"
  },
  {
    "id": "user-2",
    "name": "Zoe",
    "avatar": "https://example.com/zoe.jpg",
    "role": "member"
  }
]
```

---

#### 7. 邀請成員

```
POST /api/v1/refrigerators/:id/members
```

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "member"
}
```

**Response:** `201 Created` 或邀請連結

---

#### 8. 加入群組（透過邀請碼）

```
POST /api/v1/refrigerators/:id/members
```

**Request Body:**
```json
{
  "inviteCode": "ABC123"
}
```

**Response:** 加入後的成員物件

---

#### 9. 移除成員 / 離開群組

```
DELETE /api/v1/refrigerators/:id/members/:memberId
```

**Response:** `204 No Content`

---

### 🟢 低優先：權限相關

#### 10. 更新成員權限

```
PATCH /api/v1/refrigerators/:id/members/:memberId
```

**Request Body:**
```json
{
  "role": "owner"
}
```

**Response:** 更新後的成員物件

---

## 型別定義

### Group（群組）

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string (UUID) | ✅ | 群組唯一識別碼 |
| `name` | string | ✅ | 群組名稱 |
| `admin` | string | ⚪ | 管理員名稱（顯示用） |
| `members` | Member[] | ⚪ | 成員列表 |
| `imageUrl` | string (URL) | ⚪ | 群組圖片 |
| `plan` | `"free"` \| `"premium"` | ⚪ | 訂閱方案 |
| `createdAt` | ISO 8601 | ⚪ | 建立時間 |
| `updatedAt` | ISO 8601 | ⚪ | 更新時間 |

### Member（成員）

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string (UUID) | ✅ | 成員唯一識別碼 |
| `name` | string | ✅ | 成員名稱 |
| `avatar` | string (URL) | ✅ | 頭像圖片 URL |
| `role` | `"owner"` \| `"member"` | ✅ | 角色 |

---

## 前端不需要的欄位

| 欄位 | 原因 |
|------|------|
| `color` | 已移除，前端不使用 |
| `characterColor` | 已移除，前端不使用 |
| `colour` | 已移除，前端改用預設圖片作為 fallback |

---

## 特殊需求

### 識別當前使用者

前端需要識別 `members` 中的「自己」，用於顯示「(我)」。

**目前做法**：比對 `member.name` 與當前登入使用者的 `displayName`

**建議**：後端可在成員物件中加入 `isCurrentUser: boolean`

---

## 備註

- 群組沒有 `imageUrl` 時，前端使用 `Avatar-1.png` 作為預設圖片
- 成員角色只有兩種：`owner`=「擁有者」, `member`=「成員」
- 所有可選欄位（⚪）如後端無法提供，前端會使用預設值或不顯示


