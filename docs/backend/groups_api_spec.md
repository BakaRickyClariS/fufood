# 群組（冰箱）API 規格文件

**版本**: v1.2  
**最後更新**: 2025-12-29  
**前端模組**: `src/modules/groups`  
**目的**: 給後端對照前端預期的 API 格式

---

## 目錄

- [API 概覽](#api-概覽)
- [認證機制](#認證機制)
- [資料型別定義](#資料型別定義)
- [已實作 API 端點](#已實作-api-端點)
- [待實作 API 端點](#待實作-api-端點)
- [錯誤回應格式](#錯誤回應格式)

---

## API 概覽

### ✅ 已實作

| #   | 方法     | 路徑                                              | 功能             | 狀態 |
| --- | -------- | ------------------------------------------------- | ---------------- | ---- |
| 1   | `GET`    | `/api/v1/refrigerators`                           | 取得所有群組     | ✅   |
| 2   | `GET`    | `/api/v1/refrigerators/{id}`                      | 取得單一群組     | ✅   |
| 3   | `POST`   | `/api/v1/refrigerators`                           | 建立群組         | ✅   |
| 4   | `PUT`    | `/api/v1/refrigerators/{id}`                      | 更新群組         | ✅   |
| 5   | `DELETE` | `/api/v1/refrigerators/{id}`                      | 刪除群組         | ✅   |
| 6   | `GET`    | `/api/v1/refrigerators/{id}/members`              | 取得群組成員     | ✅   |
| 7   | `POST`   | `/api/v1/refrigerators/{id}/invitations`          | 產生邀請連結     | ✅   |
| 8   | `GET`    | `/api/v1/invitations/{token}`                     | 取得邀請資訊     | ✅   |
| 9   | `POST`   | `/api/v1/refrigerator_memberships`                | 加入群組 (Token) | ✅   |

### ⏳ 待實作（前端已有 UI，等後端 API）

| #   | 方法     | 路徑                                              | 功能             | 狀態 |
| --- | -------- | ------------------------------------------------- | ---------------- | ---- |
| 10  | `POST`   | `/api/v1/refrigerators/{id}/members`              | 邀請成員 (Email) | ⏳   |
| 11  | `DELETE` | `/api/v1/refrigerators/{id}/members/{memberId}`   | 移除成員         | ⏳   |
| 12  | `PATCH`  | `/api/v1/refrigerators/{id}/members/{memberId}`   | 更新成員權限     | ⏳   |
| 13  | `GET`    | `/api/v1/users/friends?q={query}`                 | 搜尋好友         | ⏳   |

---

## 認證機制

- **方式**: HttpOnly Cookie
- **前端設定**: `credentials: 'include'`

---

## 資料型別定義

### Group（群組）

```typescript
type Group = {
  id: string;              // UUID
  name: string;            // 群組名稱
  admin?: string;          // 管理者 ID
  members?: GroupMember[]; // 成員列表
  imageUrl?: string;       // 群組圖片 URL
  plan?: 'free' | 'premium'; // 方案類型
  createdAt?: Date;        // 建立時間
  updatedAt?: Date;        // 更新時間
};
```

### GroupMember（群組成員）

```typescript
type GroupMember = {
  id: string;           // 成員 ID
  name: string;         // 成員名稱
  avatar: string;       // 頭像 URL
  role: 'owner' | 'member'; // 權限角色
};
```

### CreateGroupForm（建立群組請求）

```typescript
type CreateGroupForm = {
  name: string;      // 必填，群組名稱
  colour?: string;   // 選填，冰箱顏色
};
```

### UpdateGroupForm（更新群組請求）

```typescript
type UpdateGroupForm = {
  name?: string;     // 選填，新的群組名稱
};
```

### JoinGroupForm（加入群組請求）

```typescript
type JoinGroupForm = {
  invitationToken: string;  // 邀請 Token
};
```

### InvitationResponse（邀請資訊回應）

```typescript
type InvitationResponse = {
  id: string;              // 邀請 ID
  token: string;           // 邀請 Token
  refrigeratorId: string;  // 冰箱/群組 ID
  refrigeratorName?: string; // 冰箱/群組名稱
  invitedById: string;     // 邀請者 ID
  inviterName?: string;    // 邀請者名稱
  expiresAt: string;       // 過期時間 (ISO 8601)
};
```

### Friend（好友）

```typescript
type Friend = {
  id: string;        // 好友 ID
  name: string;      // 好友名稱
  avatar: string;    // 頭像 URL
  lineId?: string;   // LINE ID
};
```

---

## 已實作 API 端點

### 1. 取得所有群組

```
GET /api/v1/refrigerators
```

**成功回應 (200)**:
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "我的冰箱",
      "admin": "user-uuid",
      "plan": "free",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-29T15:00:00Z"
    }
  ]
}
```

---

### 2. 取得單一群組

```
GET /api/v1/refrigerators/{id}
```

**成功回應 (200)**:
```json
{
  "data": {
    "id": "uuid-1",
    "name": "我的冰箱",
    "admin": "user-uuid",
    "members": [
      {
        "id": "member-1",
        "name": "John",
        "avatar": "https://...",
        "role": "owner"
      }
    ]
  }
}
```

---

### 3. 建立群組

```
POST /api/v1/refrigerators
```

**請求 Body**:
```json
{
  "name": "家庭冰箱",
  "colour": "green"
}
```

| 欄位     | 類型   | 必填 | 說明     |
| -------- | ------ | :--: | -------- |
| `name`   | string | ✅   | 群組名稱 |
| `colour` | string | ❌   | 顏色     |

**成功回應 (201)**:
```json
{
  "data": {
    "id": "new-uuid",
    "name": "家庭冰箱",
    "createdAt": "2025-12-29T21:00:00Z"
  }
}
```

---

### 4. 更新群組

```
PUT /api/v1/refrigerators/{id}
```

**請求 Body**:
```json
{
  "name": "新名稱"
}
```

---

### 5. 刪除群組

```
DELETE /api/v1/refrigerators/{id}
```

**成功回應**: `204 No Content` 或 `200`

---

### 6. 取得群組成員

```
GET /api/v1/refrigerators/{id}/members
```

**成功回應 (200)**:
```json
{
  "data": [
    {
      "id": "member-1",
      "name": "John",
      "avatar": "https://example.com/avatar.jpg",
      "role": "owner"
    }
  ]
}
```

---

### 7. 產生邀請連結

```
POST /api/v1/refrigerators/{id}/invitations
```

**請求 Body**: `{}`

**成功回應 (200)**:
```json
{
  "data": {
    "token": "abc123def456",
    "expiresAt": "2025-12-30T21:00:00Z"
  }
}
```

---

### 8. 取得邀請資訊

```
GET /api/v1/invitations/{token}
```

**成功回應 (200)**:
```json
{
  "data": {
    "id": "invitation-uuid",
    "token": "abc123def456",
    "refrigeratorId": "group-uuid",
    "refrigeratorName": "家庭冰箱",
    "invitedById": "user-uuid",
    "inviterName": "John",
    "expiresAt": "2025-12-30T21:00:00Z"
  }
}
```

---

### 9. 加入群組 (Token)

```
POST /api/v1/refrigerator_memberships
```

**請求 Body**:
```json
{
  "invitationToken": "abc123def456"
}
```

**成功回應 (200)**:
```json
{
  "message": "Joined successfully"
}
```

---

## 待實作 API 端點

> 以下是前端已有 UI 或 API 呼叫代碼，但後端可能尚未完成的 API

### 10. 邀請成員 (Email 方式)

```
POST /api/v1/refrigerators/{id}/members
```

**請求 Body**:
```json
{
  "email": "friend@example.com",
  "role": "member"
}
```

| 欄位    | 類型   | 必填 | 說明                      |
| ------- | ------ | :--: | ------------------------- |
| `email` | string | ✅   | 被邀請者 Email            |
| `role`  | string | ❌   | 角色 (`owner` / `member`) |

---

### 11. 移除成員

```
DELETE /api/v1/refrigerators/{id}/members/{memberId}
```

---

### 12. 更新成員權限

```
PATCH /api/v1/refrigerators/{id}/members/{memberId}
```

**請求 Body**:
```json
{
  "role": "owner"
}
```

---

### 13. 搜尋好友

```
GET /api/v1/users/friends?q={query}
```

**成功回應 (200)**:
```json
{
  "data": [
    {
      "id": "friend-1",
      "name": "Alice",
      "avatar": "https://example.com/alice.jpg",
      "lineId": "alice_123"
    }
  ]
}
```

---

## 錯誤回應格式

```json
{
  "status": false,
  "message": "錯誤描述訊息"
}
```

### 常見錯誤

| 狀態碼 | 說明             |
| ------ | ---------------- |
| 400    | 請求參數錯誤     |
| 401    | 未授權（需登入） |
| 403    | 無權限操作       |
| 404    | 資源不存在       |
| 500    | 伺服器內部錯誤   |

---

## 變更歷史

| 版本 | 日期       | 說明                                 |
| ---- | ---------- | ------------------------------------ |
| v1.2 | 2025-12-29 | 以前端實作為主，區分已實作/待實作   |
| v1.1 | 2025-12-29 | 對齊官方 API Guide                   |
| v1.0 | 2025-12-29 | 初版                                 |
