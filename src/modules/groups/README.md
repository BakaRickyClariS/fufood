# Groups 模組

## 概述

Groups 模組負責處理群組管理相關功能，包含群組的 CRUD 操作、成員管理等。採用分層架構設計，支援 Mock 資料與真實 API 的無縫切換。

## 目錄結構

```
src/modules/groups/
├── api/                    # API 層
│   ├── mock/              # Mock 資料
│   │   └── groupsMockData.ts
│   ├── groupsApi.ts       # API 實作
│   └── index.ts
├── components/            # UI 組件
│   ├── modals/           # Modal 組件
│   │   ├── GroupSettingsModal.tsx
│   │   ├── CreateGroupModal.tsx
│   │   ├── EditGroupModal.tsx
│   │   └── MembersModal.tsx
│   └── ui/               # 通用 UI 組件
│       ├── GroupCard.tsx
│       ├── MemberItem.tsx
│       └── MemberList.tsx
├── hooks/                 # Custom Hooks
│   ├── useGroups.ts
│   ├── useGroupMembers.ts
│   └── index.ts
├── types/                 # TypeScript 型別
│   └── group.types.ts
└── index.ts              # 統一匯出
```

---

## API 端點

### 環境變數控制

所有 API 呼叫都透過環境變數 `VITE_USE_MOCK_API` 控制：
- `true` (預設)：使用 Mock 資料
- `false`：使用真實 API

---

## 群組管理端點

### 1. 取得所有群組

**端點**：`GET /api/groups`

**請求格式**：無 (使用 Header 中的 Token)

**回應格式**：
```typescript
[
  {
    id: string;
    name: string;
    admin: string;
    members: GroupMember[];
    color: string;              // Tailwind 背景色類別
    characterColor: string;     // Tailwind 文字色類別
    plan: 'free' | 'premium';
    createdAt: Date;
    updatedAt: Date;
  }
]
```

**狀態碼**：
- `200 OK`：取得成功
- `401 Unauthorized`：未登入
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 回傳 3 個預設群組
- 延遲 500ms

---

### 2. 建立群組

**端點**：`POST /api/groups`

**請求格式**：
```typescript
{
  name: string;              // 群組名稱
  color: string;             // 背景色類別，如 'bg-red-100'
  characterColor: string;    // 文字色類別，如 'bg-red-400'
}
```

**回應格式**：
```typescript
{
  id: string;
  name: string;
  admin: string;
  members: [];
  color: string;
  characterColor: string;
  plan: 'free';
  createdAt: Date;
  updatedAt: Date;
}
```

**狀態碼**：
- `201 Created`：建立成功
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：未登入
- `403 Forbidden`：已達免費方案群組上限
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 自動生成新的群組 ID
- 設定當前使用者為 admin
- 延遲 500ms

---

### 3. 更新群組

**端點**：`PUT /api/groups/:id`

**請求格式**：
```typescript
{
  name?: string;
  color?: string;
  characterColor?: string;
}
```

**回應格式**：
```typescript
{
  id: string;
  name: string;
  admin: string;
  members: GroupMember[];
  color: string;
  characterColor: string;
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}
```

**狀態碼**：
- `200 OK`：更新成功
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：未登入
- `403 Forbidden`：無權限修改
- `404 Not Found`：群組不存在
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 更新指定群組資料
- 更新 `updatedAt` 時間戳
- 延遲 500ms

---

### 4. 刪除群組

**端點**：`DELETE /api/groups/:id`

**請求格式**：無

**回應格式**：無內容

**狀態碼**：
- `204 No Content`：刪除成功
- `401 Unauthorized`：未登入
- `403 Forbidden`：無權限刪除（僅 owner 可刪除）
- `404 Not Found`：群組不存在
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 延遲 500ms
- 永遠成功

---

## 成員管理端點

### 5. 取得群組成員

**端點**：`GET /api/groups/:id/members`

**請求格式**：無

**回應格式**：
```typescript
[
  {
    id: string;
    name: string;
    role: 'owner' | 'organizer' | 'member';
    avatar: string;  // Tailwind 背景色類別
  }
]
```

**狀態碼**：
- `200 OK`：取得成功
- `401 Unauthorized`：未登入
- `403 Forbidden`：非群組成員
- `404 Not Found`：群組不存在
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 回傳預設的 3 位成員
- 延遲 300ms

---

### 6. 邀請成員

**端點**：`POST /api/groups/:id/members`

**請求格式**：
```typescript
{
  email: string;  // 被邀請人的 Email
}
```

**回應格式**：無內容

**狀態碼**：
- `201 Created`：邀請成功
- `400 Bad Request`：請求格式錯誤或 Email 無效
- `401 Unauthorized`：未登入
- `403 Forbidden`：非 owner 或 organizer
- `404 Not Found`：群組不存在
- `409 Conflict`：使用者已是成員
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 延遲 500ms
- 永遠成功

---

### 7. 移除成員

**端點**：`DELETE /api/groups/:id/members/:memberId`

**請求格式**：無

**回應格式**：無內容

**狀態碼**：
- `204 No Content`：移除成功
- `401 Unauthorized`：未登入
- `403 Forbidden`：無權限移除（僅 owner/organizer 可移除）
- `404 Not Found`：群組或成員不存在
- `409 Conflict`：無法移除 owner
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 延遲 500ms
- 永遠成功

---

### 8. 更新成員權限

**端點**：`PATCH /api/groups/:id/members/:memberId`

**請求格式**：
```typescript
{
  role: 'organizer' | 'member';
}
```

**回應格式**：無內容

**狀態碼**：
- `200 OK`：更新成功
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：未登入
- `403 Forbidden`：無權限修改（僅 owner 可修改）
- `404 Not Found`：群組或成員不存在
- `409 Conflict`：無法修改 owner 權限
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 延遲 500ms
- 永遠成功

---

## Hooks 使用

### useGroups

```typescript
const {
  groups,        // 群組列表
  isLoading,     // 載入狀態
  error,         // 錯誤訊息
  createGroup,   // 建立群組
  updateGroup,   // 更新群組
  deleteGroup,   // 刪除群組
  refetch,       // 重新取得資料
} = useGroups();
```

**範例**：
```typescript
// 建立群組
await createGroup({
  name: 'New Group',
  color: 'bg-blue-100',
  characterColor: 'bg-blue-400',
});

// 更新群組
await updateGroup('group-id', {
  name: 'Updated Name',
});

// 刪除群組
await deleteGroup('group-id');
```

---

### useGroupMembers

```typescript
const {
  members,         // 成員列表
  isLoading,       // 載入狀態
  error,           // 錯誤訊息
  inviteMember,    // 邀請成員
  removeMember,    // 移除成員
  updateMemberRole,// 更新成員權限
  refetch,         // 重新取得資料
} = useGroupMembers(groupId);
```

**範例**：
```typescript
// 邀請成員
await inviteMember({ email: 'user@example.com' });

// 移除成員
await removeMember('member-id');

// 更新成員權限
await updateMemberRole('member-id', 'organizer');
```

---

## 資料格式定義

### Group
```typescript
type Group = {
  id: string;
  name: string;
  admin: string;
  members: GroupMember[];
  color: string;              // Tailwind 類別
  characterColor: string;     // Tailwind 類別
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
};
```

### GroupMember
```typescript
type GroupMember = {
  id: string;
  name: string;
  role: 'owner' | 'organizer' | 'member';
  avatar: string;  // Tailwind 類別
};
```

### CreateGroupForm
```typescript
type CreateGroupForm = {
  name: string;
  color: string;
  characterColor: string;
};
```

### UpdateGroupForm
```typescript
type UpdateGroupForm = {
  name?: string;
  color?: string;
  characterColor?: string;
};
```

### InviteMemberForm
```typescript
type InviteMemberForm = {
  email: string;
};
```

---

## 權限說明

### 角色層級
1. **Owner（擁有者）**：
   - 擁有所有權限
   - 可以刪除群組
   - 可以修改所有成員的權限
   - 每個群組僅有一位 owner

2. **Organizer（組織者）**：
   - 可以邀請/移除成員（除了 owner）
   - 可以編輯群組資訊
   - 無法刪除群組

3. **Member（成員）**：
   - 可以查看群組資訊
   - 可以查看成員列表
   - 無編輯權限

### 操作權限表

| 操作 | Owner | Organizer | Member |
|------|-------|-----------|--------|
| 查看群組 | ✅ | ✅ | ✅ |
| 編輯群組 | ✅ | ✅ | ❌ |
| 刪除群組 | ✅ | ❌ | ❌ |
| 查看成員 | ✅ | ✅ | ✅ |
| 邀請成員 | ✅ | ✅ | ❌ |
| 移除成員 | ✅ | ✅ (除 owner) | ❌ |
| 修改權限 | ✅ | ❌ | ❌ |

---

## 錯誤處理

所有 API 錯誤都會拋出標準的 `Error` 物件：

```typescript
try {
  await groupsApi.create(formData);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // "建立群組失敗"
  }
}
```

---

## 切換真實 API

1. 修改 `.env`：
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=https://your-api.com/api
   ```

2. 確保後端 API 符合上述端點與資料格式

3. 重新啟動開發伺服器：
   ```bash
   npm run dev
   ```

---

## 注意事項

1. **群組上限**：免費方案限制建立群組數量
2. **權限檢查**：所有操作都需要在後端進行權限驗證
3. **成員邀請**：建議實作 Email 驗證機制
4. **群組刪除**：建議加入二次確認機制

---

## Mock 資料

預設提供 3 個測試群組：
- My Home (owner: Jocelyn, 3 members)
- JJ Home (owner: JJ, 1 member)
- Ricky Home (owner: Ricky, 1 member, premium)
