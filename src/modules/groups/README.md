# Groups Module（群組管理）

## 目錄
- [概要](#概要)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別](#型別)
- [API 規格](#api-規格)
- [Hooks](#hooks)
- [環境變數](#環境變數)
- [權限與方案](#權限與方案)
- [Mock 資料](#mock-資料)

---

## 概要
負責家庭/團隊群組的建立、管理與成員權限。依精簡後路由：成員操作合併為三條（加入/邀請、離開/移除、更新權限）。

### 核心功能
1. 群組 CRUD
2. 成員加入/邀請、移除、權限更新
3. 權限模型：owner / organizer / member
4.（可選）方案與設定管理

---

## 目錄結構
```
groups/
├── api/
│   ├── groupsApi.ts
│   └── index.ts
├── mock/
│   └── groupsMockData.ts
├── components/
│   ├── modals/
│   └── ui/
├── hooks/
│   ├── useGroups.ts
│   └── useGroupMembers.ts
├── types/
│   └── group.types.ts
└── index.ts
```

---

## 型別
```typescript
export type GroupMember = {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'organizer' | 'member';
};

export type Group = {
  id: string;
  name: string;
  admin: string;
  members: GroupMember[];
  color: string;
  characterColor: string;
  plan: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupForm = Pick<Group, 'name' | 'color' | 'characterColor'>;
export type UpdateGroupForm = Partial<CreateGroupForm>;
export type InviteMemberForm = { email: string; role?: GroupMember['role'] }; // role 預設 member
```

---

## API 規格

### 路由（對應 API_REFERENCE_V2 #10-#17）
- `GET /api/v1/groups`：群組列表
- `POST /api/v1/groups`：建立群組
- `GET /api/v1/groups/{id}`：群組詳情
- `PUT /api/v1/groups/{id}`：更新群組
- `DELETE /api/v1/groups/{id}`：刪除群組
- `POST /api/v1/groups/{id}/members`：加入/邀請成員（依 body 區分，例如帶邀請碼或 email）
- `DELETE /api/v1/groups/{id}/members/{memberId}`：離開或移除成員
- `PATCH /api/v1/groups/{id}/members/{memberId}`：更新成員權限

### GroupsApi 介面
```typescript
export const groupsApi = {
  getAll: () => Promise<Group[]>;
  getById: (id: string) => Promise<Group>;
  create: (data: CreateGroupForm) => Promise<Group>;
  update: (id: string, data: UpdateGroupForm) => Promise<Group>;
  delete: (id: string) => Promise<void>;
  addOrInviteMember: (groupId: string, data: InviteMemberForm & { mode?: 'invite' | 'join' }) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  updateMemberRole: (groupId: string, memberId: string, role: GroupMember['role']) => Promise<void>;
};
```

---

## Hooks

### `useGroups.ts`
管理群組列表與 CRUD。
```typescript
const useGroups = () => ({
  groups: Group[],
  isLoading: boolean,
  error: Error | null,
  createGroup: (form: CreateGroupForm) => Promise<void>,
  updateGroup: (id: string, form: UpdateGroupForm) => Promise<void>,
  deleteGroup: (id: string) => Promise<void>,
  refetch: () => Promise<void>,
});
```

### `useGroupMembers.ts`
管理單一群組成員。
```typescript
const useGroupMembers = (groupId: string) => ({
  members: GroupMember[],
  isLoading: boolean,
  error: Error | null,
  addOrInvite: (form: InviteMemberForm & { mode?: 'invite' | 'join' }) => Promise<void>,
  removeMember: (memberId: string) => Promise<void>,
  updateRole: (memberId: string, role: GroupMember['role']) => Promise<void>,
  refetch: () => Promise<void>,
});
```

---

## 環境變數
| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |

---

## 權限與方案
- 角色：`owner` > `organizer` > `member`
- 基本操作：建立/刪除群組需 owner；移除成員/調整權限需 owner 或 organizer（依實作）。
- 方案（如有）：free/premium 可控制群組數量、成員上限等（可依業務調整）。

---

## Mock 資料
- `groupsMockData.ts`：提供群組與成員範例，用於本地開發。

---

## TopNav 整合

TopNav 組件會顯示當前群組的成員大頭貼與群組選擇器。

### 相關共用組件

| 組件 | 路徑 | 說明 |
| --- | --- | --- |
| `MemberAvatars` | `@/shared/components/ui/MemberAvatars.tsx` | 顯示成員大頭貼群組（最多 3 個，超過用 ... 表示） |
| `HomeModal` | `@/shared/components/layout/HomeModal.tsx` | 從下方彈出的群組成員列表 Modal |
| `MembershipBadge` | `@/shared/components/ui/MembershipBadge.tsx` | 會員等級徽章（定位於大頭貼左下角） |

### 使用方式

```typescript
import { MemberAvatars } from '@/shared/components/ui/MemberAvatars';
import { HomeModal } from '@/shared/components/layout/HomeModal';

// MemberAvatars 使用
<MemberAvatars members={group.members} maxDisplay={3} />

// HomeModal 使用
<HomeModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  currentUser={{ name: '使用者', avatar: '...', role: 'owner' }}
  members={group.members}
  onEditMembers={() => { /* 處理編輯成員 */ }}
/>
```

### 資料來源

目前 TopNav 使用 mock 資料顯示群組成員。後續整合 API 時：
1. 使用 `useGroups` hook 取得群組列表
2. 管理「當前選中群組」狀態
3. 從當前群組取得成員列表
