# Groups Module API Specification

**版本**: v1.0  
**文件用途**: 後端協作規格（群組 CRUD、成員管理、邀請/加入/離開）

---

## 1. 基本規範
- Base URL: `/api/v1`
- 需要 Access Token（`Authorization: Bearer <token>`）

標準錯誤格式同 `auth_api_spec.md`。

---

## 2. 資料模型

### 2.1 Group
```typescript
type Group = {
  id: string;
  name: string;
  admin: string;           // 建立者名稱
  members: GroupMember[];
  color: string;
  characterColor: string;
  plan: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
};
```

### 2.2 GroupMember
```typescript
type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'organizer' | 'member';
};
```

### 2.3 InviteMemberForm
```typescript
type InviteMemberForm = {
  email: string;
  role?: GroupMember['role']; // default member
};
```

---

## 3. Groups API

### 3.1 取得群組列表
- **GET** `/groups`
- 200 → `Group[]`

### 3.2 建立群組
- **POST** `/groups`
- Body: `{ name, color?, characterColor? }`
- 201 → `Group`

### 3.3 取得群組詳情
- **GET** `/groups/{id}`
- 200 → `Group`

### 3.4 更新群組
- **PUT** `/groups/{id}`
- Body: `{ name?, color?, characterColor? }`
- 200 → `Group`

### 3.5 刪除群組
- **DELETE** `/groups/{id}`
- 204 或 `{ success: true }`

### 3.6 邀請成員
- **POST** `/groups/{id}/invite`
- Body: `InviteMemberForm`
- 204 或 `{ success: true }`

### 3.7 加入群組
- **POST** `/groups/{id}/join`
- Body: 可攜帶 `{ inviteCode?: string }`
- 204 或 `{ success: true }`

### 3.8 離開群組
- **DELETE** `/groups/{id}/leave`
- 204 或 `{ success: true }`

### 3.9 移除成員
- **DELETE** `/groups/{id}/remove/{memberId}`
- 204 或 `{ success: true }`

### 3.10 更新成員權限
- **PATCH** `/groups/{id}/members/{memberId}`
- Body: `{ role: 'owner' | 'organizer' | 'member' }`
- 204 或 `{ success: true }`

---

## 4. 角色權限建議
| 操作 | owner | organizer | member |
| --- | --- | --- | --- |
| 編輯/刪除群組 | ✓ | ✓ | ✗ |
| 邀請/移除成員 | ✓ | ✓ | ✗ |
| 更新成員角色 | ✓ | ✗ | ✗ |
| 離開群組 | ✗ | ✓ | ✓ |

