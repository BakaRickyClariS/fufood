# Groups Module (群組管理模組)

## 📋 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [元件說明 (Components)](#元件說明-components)
- [Hooks 詳解](#hooks-詳解)
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責處理**家庭群組**的建立、管理與成員協作功能。支援多人共享食材庫存、群組設定、成員權限管理等功能，是 Fufood 的核心協作模組。

### 核心功能
1. **群組管理**: 建立、編輯、刪除群組
2. **成員管理**: 邀請、移除成員
3. **權限控制**: 擁有者 (Owner)、管理員 (Organizer)、成員 (Member) 三級權限
4. **群組設定**: 自訂群組名稱、顏色、圖示
5. **方案管理**: 免費版 (Free) 與進階版 (Premium) 方案
6. **Mock 模式**: 支援離線開發與測試

---

## 目錄結構

\`\`\`
groups/
├── api/                      # API 層
│   ├── groupsApi.ts         # API 實作
│   ├── index.ts             # API 匯出
│   └── mock/
│       └── groupsMockData.ts  # Mock 資料
├── components/               # UI 元件
│   ├── modals/              # Modal 元件
│   │   ├── CreateGroupModal.tsx
│   │   ├── EditGroupModal.tsx
│   │   ├── GroupSettingsModal.tsx
│   │   └── MembersModal.tsx
│   └── ui/                  # 基礎 UI 元件
│       ├── GroupCard.tsx
│       ├── MemberItem.tsx
│       └── MemberList.tsx
├── hooks/                    # 自定義 Hooks
│   ├── index.ts
│   ├── useGroups.ts         # 群組 Hook
│   └── useGroupMembers.ts   # 成員 Hook
├── types/                    # TypeScript 型別
│   └── group.types.ts       # 群組型別
└── index.ts                  # 模組匯出
\`\`\`

---

## 型別定義 (Types)

### GroupMember (群組成員)
```typescript
export type GroupMember = {
  id: string;
  name: string;
  avatar: string;       // 頭像 URL 或顏色
  role: 'owner' | 'organizer' | 'member';
};
```

**權限說明**:
- `owner`: 擁有者，可執行所有操作
- `organizer`: 管理員，可管理成員與編輯群組
- `member`: 一般成員，僅可查看

---

### Group (群組)
```typescript
export type Group = {
  id: string;
  name: string;
  admin: string;           // 建立者名稱
  members: GroupMember[];
  color: string;           // 群組主色
  characterColor: string;  // 圖示/字元顏色
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
};
```

---

### CreateGroupForm (建立群組表單)
```typescript
export type CreateGroupForm = Pick<Group, 'name' | 'color' | 'characterColor'>;
```

**範例**:
```typescript
const form: CreateGroupForm = {
  name: '我的家庭',
  color: '#FF6B6B',
  characterColor: '#FFFFFF',
};
```

---

### UpdateGroupForm (更新群組表單)
```typescript
export type UpdateGroupForm = Partial<
  Pick<Group, 'name' | 'color' | 'characterColor'>
>;
```

---

### InviteMemberForm (邀請成員表單)
```typescript
export type InviteMemberForm = {
  email: string;
  role?: GroupMember['role'];  // 預設為 'member'
};
```

---

### GroupModalView (Modal 狀態)
```typescript
export type GroupModalView = 'list' | 'create' | 'edit' | 'members';
```

---

## API 規格

### GroupsApi 介面

```typescript
export const groupsApi = {
  getAll: () => Promise<Group[]>;
  getMembers: (groupId: string) => Promise<GroupMember[]>;
  create: (data: CreateGroupForm) => Promise<Group>;
  update: (id: string, data: UpdateGroupForm) => Promise<Group>;
  delete: (id: string) => Promise<void>;
  inviteMember: (groupId: string, data: InviteMemberForm) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  updateMemberRole: (groupId: string, memberId: string, role: GroupMember['role']) => Promise<void>;
};
```

---

### 1. **getAll** - 取得所有群組

#### 端點
\`\`\`
GET /api/groups
\`\`\`

#### 請求格式
無請求 body

#### 回應格式
```typescript
Group[]
```

#### 回應範例
```json
[
  {
    "id": "group-001",
    "name": "我的家庭",
    "admin": "Jocelyn",
    "members": [
      {
        "id": "user-001",
        "name": "Jocelyn",
        "avatar": "bg-blue-200",
        "role": "owner"
      }
    ],
    "color": "#FF6B6B",
    "characterColor": "#FFFFFF",
    "plan": "free",
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2025-11-01T00:00:00.000Z"
  }
]
```

---

### 2. **getMembers** - 取得群組成員

#### 端點
\`\`\`
GET /api/groups/:groupId/members
\`\`\`

#### 請求格式
無請求 body

#### 回應格式
```typescript
GroupMember[]
```

#### 回應範例
```json
[
  {
    "id": "user-001",
    "name": "Jocelyn",
    "avatar": "bg-blue-200",
    "role": "owner"
  },
  {
    "id": "user-002",
    "name": "張三",
    "avatar": "bg-green-200",
    "role": "member"
  }
]
```

---

### 3. **create** - 建立群組

#### 端點
\`\`\`
POST /api/groups
\`\`\`

#### 請求格式
```typescript
CreateGroupForm
```

#### 請求範例
```json
{
  "name": "新群組",
  "color": "#4ECDC4",
  "characterColor": "#FFFFFF"
}
```

#### 回應格式
```typescript
Group
```

#### 回應範例
```json
{
  "id": "group-002",
  "name": "新群組",
  "admin": "Jocelyn",
  "members": [],
  "color": "#4ECDC4",
  "characterColor": "#FFFFFF",
  "plan": "free",
  "createdAt": "2025-12-01T10:54:00.000Z",
  "updatedAt": "2025-12-01T10:54:00.000Z"
}
```

---

### 4. **update** - 更新群組

#### 端點
\`\`\`
PUT /api/groups/:id
\`\`\`

#### 請求格式
```typescript
UpdateGroupForm
```

#### 請求範例
```json
{
  "name": "更新的群組名稱",
  "color": "#FF6B6B"
}
```

#### 回應格式
```typescript
Group
```

---

### 5. **delete** - 刪除群組

#### 端點
\`\`\`
DELETE /api/groups/:id
\`\`\`

#### 請求格式
無請求 body

#### 回應格式
```typescript
void
```

---

### 6. **inviteMember** - 邀請成員

#### 端點
\`\`\`
POST /api/groups/:groupId/members
\`\`\`

#### 請求格式
```typescript
InviteMemberForm
```

#### 請求範例
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

#### 回應格式
```typescript
void
```

---

### 7. **removeMember** - 移除成員

#### 端點
\`\`\`
DELETE /api/groups/:groupId/members/:memberId
\`\`\`

#### 請求格式
無請求 body

#### 回應格式
```typescript
void
```

---

### 8. **updateMemberRole** - 更新成員權限

#### 端點
\`\`\`
PATCH /api/groups/:groupId/members/:memberId
\`\`\`

#### 請求格式
```json
{
  "role": "organizer"
}
```

#### 回應格式
```typescript
void
```

---

## 元件說明 (Components)

### 📋 modals/ (Modal 元件)

#### `CreateGroupModal.tsx`
- 建立新群組的 Modal
- 包含表單: 群組名稱、顏色選擇器
- 整合 `useGroups` Hook

**功能**:
- 輸入群組名稱
- 選擇群組主色與圖示顏色
- 提交建立請求
- 顯示建立狀態與錯誤

---

#### `EditGroupModal.tsx`
- 編輯群組資訊的 Modal
- 預填現有群組資料
- 整合 `useGroups` Hook

**功能**:
- 修改群組名稱
- 更新群組顏色
- 提交更新請求
- 刪除群組 (僅擁有者)

---

#### `GroupSettingsModal.tsx`
- 群組設定的 Modal
- 顯示群組詳細資訊與設定選項

**功能**:
- 查看群組資訊
- 管理訂閱方案
- 離開群組
- 刪除群組

---

#### `MembersModal.tsx`
- 成員管理的 Modal
- 顯示成員列表與邀請功能
- 整合 `useGroupMembers` Hook

**功能**:
- 查看所有成員
- 邀請新成員 (by Email)
- 移除成員
- 更新成員權限

---

### 🎨 ui/ (基礎 UI 元件)

#### `GroupCard.tsx`
```typescript
type GroupCardProps = {
  group: Group;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};
```

**功能**:
- 顯示群組卡片
- 群組名稱、成員數量、方案
- 支援點擊、編輯、刪除事件

---

#### `MemberItem.tsx`
```typescript
type MemberItemProps = {
  member: GroupMember;
  onRoleChange?: (role: GroupMember['role']) => void;
  onRemove?: () => void;
  canManage?: boolean;
};
```

**功能**:
- 顯示成員項目
- 頭像、名稱、權限標籤
- 支援權限變更與移除 (需權限)

---

#### `MemberList.tsx`
```typescript
type MemberListProps = {
  members: GroupMember[];
  onRoleChange?: (memberId: string, role: GroupMember['role']) => void;
  onRemove?: (memberId: string) => void;
  currentUserRole?: GroupMember['role'];
};
```

**功能**:
- 顯示成員列表
- 整合 `MemberItem`
- 根據權限顯示操作按鈕

---

## Hooks 詳解

### `useGroups.ts`

```typescript
const useGroups = () => {
  return {
    groups: Group[];
    isLoading: boolean;
    error: Error | null;
    createGroup: (form: CreateGroupForm) => Promise<void>;
    updateGroup: (id: string, form: UpdateGroupForm) => Promise<void>;
    deleteGroup: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```

**功能**:
- 管理所有群組資料
- 自動載入群組列表
- 提供 CRUD 操作方法
- 狀態管理: `groups`, `isLoading`, `error`

**使用範例**:
```typescript
const { groups, isLoading, createGroup, deleteGroup } = useGroups();

// 建立群組
await createGroup({
  name: '我的家庭',
  color: '#FF6B6B',
  characterColor: '#FFFFFF',
});

// 刪除群組
await deleteGroup('group-001');
```

**初始化流程**:
1. Component mount 時自動呼叫 `getAll()`
2. 載入所有群組資料
3. 更新 `groups` 狀態

---

### `useGroupMembers.ts`

```typescript
const useGroupMembers = (groupId: string) => {
  return {
    members: GroupMember[];
    isLoading: boolean;
    error: Error | null;
    inviteMember: (form: InviteMemberForm) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    updateRole: (memberId: string, role: GroupMember['role']) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```

**功能**:
- 管理特定群組的成員資料
- 自動載入成員列表
- 提供成員管理方法
- 狀態管理: `members`, `isLoading`, `error`

**使用範例**:
```typescript
const { members, inviteMember, removeMember, updateRole } = useGroupMembers('group-001');

// 邀請成員
await inviteMember({
  email: 'newmember@example.com',
  role: 'member',
});

// 移除成員
await removeMember('user-002');

// 更新權限
await updateRole('user-002', 'organizer');
```

---

## 環境變數設定

### 必要環境變數

```env
# Mock 模式 (開發用)
VITE_USE_MOCK_API=true
```

### 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |

---

## Mock 資料

### MOCK_GROUPS
```typescript
export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-001',
    name: '我的家庭',
    admin: 'Jocelyn',
    members: [
      { id: 'user-001', name: 'Jocelyn', avatar: 'bg-blue-200', role: 'owner' },
      { id: 'user-002', name: '張三', avatar: 'bg-green-200', role: 'member' },
    ],
    color: '#FF6B6B',
    characterColor: '#FFFFFF',
    plan: 'free',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
];
```

### MOCK_MEMBERS
```typescript
export const MOCK_MEMBERS: GroupMember[] = [
  { id: 'user-001', name: 'Jocelyn', avatar: 'bg-blue-200', role: 'owner' },
  { id: 'user-002', name: '張三', avatar: 'bg-green-200', role: 'organizer' },
  { id: 'user-003', name: '李四', avatar: 'bg-yellow-200', role: 'member' },
];
```

---

## 權限矩陣

| 操作 | Owner | Organizer | Member |
|-----|-------|-----------|--------|
| 查看群組 | ✅ | ✅ | ✅ |
| 編輯群組 | ✅ | ✅ | ❌ |
| 刪除群組 | ✅ | ❌ | ❌ |
| 邀請成員 | ✅ | ✅ | ❌ |
| 移除成員 | ✅ | ✅ | ❌ |
| 變更權限 | ✅ | ❌ | ❌ |
| 離開群組 | ❌ | ✅ | ✅ |

---

## 方案比較

| 功能 | Free | Premium |
|-----|------|---------|
| 群組數量 | 1 個 | 無限制 |
| 成員數量 | 5 人 | 無限制 |
| 食材庫存 | 100 項 | 無限制 |
| 歷史記錄 | 30 天 | 無限制 |
| 優先支援 | ❌ | ✅ |

---

## 未來優化方向

- [ ] 新增群組標籤/分類功能
- [ ] 實作群組公告功能
- [ ] 新增群組活動記錄
- [ ] 支援群組範本 (Template)
- [ ] 新增群組匯出功能
- [ ] 實作成員活動統計
- [ ] 新增群組邀請連結功能
- [ ] 支援子群組 (Subgroups)
