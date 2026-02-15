# 群組功能架構重構規劃（TopNav Modal 方案）

## 概述

本規劃文件旨在將目前使用獨立路由的群組功能（`/group/settings` 和 `/group/members`），重構為模組化 Modal/Drawer 組件，並整合於 [TopNav](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx) 中，不依賴任何路由。

## 目前架構分析

### 現有實作方式

目前的群組功能採用**獨立路由結構**：

```typescript
// src/routes/index.tsx
{
  path: 'group',
  children: [
    { path: 'settings', element: <GroupSettings /> },
    { path: 'members', element: <GroupMembers /> },
  ],
}
```

### 現有頁面

1. **群組設定頁面** ([Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx))
   - 路徑：`/group/settings`
   - 功能：顯示所有群組、建立新群組、編輯群組設定
   - Mock 資料：3 個測試群組

2. **成員管理頁面** ([Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx))
   - 路徑：`/group/members`
   - 功能：顯示群組成員、邀請成員、管理成員權限
   - Mock 資料：3 個測試成員

### TopNav 現有功能

[TopNav.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx) 目前已包含：

- Free Plan 徽章
- 群組選擇下拉選單（`My Home`、`JJ Home`、`Ricky Home`）
- 「+ 新增群組」選項（目前無功能）
- 房屋圖示按鈕（`HousePlus`）
- 使用者頭像

### 現有問題

1. **路由依賴性過強**：群組功能與特定路由結構綁定
2. **缺乏彈性**：無法在其他頁面輕鬆整合群組功能
3. **狀態管理分散**：群組資料散落在各個頁面組件中
4. **可重用性低**：UI 組件與路由邏輯耦合度高
5. **TopNav 功能未完成**：「+ 新增群組」和 `HousePlus` 按鈕尚未賦予功能

---

## 採用方案：模組化組件 + TopNav 整合

將群組功能完全模組化為 Modal/Drawer 組件，整合於 TopNav 中，透過按鈕觸發開啟。

### 方案優點

- ✅ **最大彈性**：不依賴路由，可在任何位置使用
- ✅ **符合現有 UI**：TopNav 已有群組相關按鈕，自然整合
- ✅ **優秀的使用者體驗**：隨時可透過 TopNav 存取群組功能
- ✅ **支援多種呈現方式**：Modal、Drawer、Sidebar 等
- ✅ **模組化設計**：適合未來擴充（如在庫存頁面顯示群組共享功能）

### 觸發點設計

#### 1. HousePlus 按鈕 → 開啟群組設定 Modal

點擊 TopNav 右側的 `HousePlus` 圖示按鈕，開啟群組列表管理 Modal（對應原 [Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx) 功能）。

```typescript
// TopNav.tsx 整合範例
const TopNav = () => {
  const [isGroupSettingsModalOpen, setIsGroupSettingsModalOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsGroupSettingsModalOpen(true)}>
        <HousePlus className="w-6 h-6" />
      </Button>
      
      <GroupSettingsModal
        open={isGroupSettingsModalOpen}
        onClose={() => setIsGroupSettingsModalOpen(false)}
      />
    </>
  );
};
```

#### 2. 下拉選單「新增群組」→ 開啟建立群組 Modal

點擊下拉選單中的「+ 新增群組」選項，開啟建立新群組的 Modal。

```typescript
<DropdownMenuItem onClick={() => setIsCreateGroupModalOpen(true)}>
  + 新增群組
</DropdownMenuItem>

<CreateGroupModal
  open={isCreateGroupModalOpen}
  onClose={() => setIsCreateGroupModalOpen(false)}
  onGroupCreated={handleGroupCreated}
/>
```

#### 3. 群組卡片「編輯成員」→ 開啟成員管理 Modal

在群組設定 Modal 中，點擊任一群組卡片的「編輯成員」按鈕，開啟成員管理 Modal（對應原 [Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx) 功能）。

---

## 檔案結構設計

```
src/
├── shared/
│   └── components/
│       └── layout/
│           └── TopNav.tsx                 # 更新：整合 Modal 觸發邏輯
└── modules/
    └── groups/
        ├── types/
        │   └── group.types.ts             # 群組型別定義
        ├── hooks/
        │   ├── useGroups.ts               # 群組資料管理
        │   └── useGroupMembers.ts         # 成員管理
        ├── components/
        │   ├── modals/
        │   │   ├── GroupSettingsModal.tsx # 群組列表管理 Modal（主要）
        │   │   ├── CreateGroupModal.tsx   # 建立群組 Modal
        │   │   ├── EditGroupModal.tsx     # 編輯群組 Modal
        │   │   └── MembersModal.tsx       # 成員管理 Modal
        │   └── ui/
        │       ├── GroupCard.tsx          # 群組卡片組件
        │       ├── MemberList.tsx         # 成員列表組件
        │       ├── MemberItem.tsx         # 成員項目組件
        │       └── GroupForm.tsx          # 群組表單組件
        └── api/
            └── groupsApi.ts               # 群組 API 呼叫（未來實作）
```

---

## 技術規範

### TypeScript 型別定義

所有群組相關的型別都應集中管理：

```typescript
// src/modules/groups/types/group.types.ts

/**
 * 群組成員型別
 */
export type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'organizer' | 'member';
}

/**
 * 群組型別
 */
export type Group = {
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

/**
 * 群組建立表單型別
 */
export type CreateGroupForm = Pick<Group, 'name' | 'color' | 'characterColor'>

/**
 * 群組更新表單型別
 */
export type UpdateGroupForm = Partial<Pick<Group, 'name' | 'color' | 'characterColor'>>

/**
 * 成員邀請表單型別
 */
export type InviteMemberForm = {
  email: string;
  role?: GroupMember['role'];
}

/**
 * Modal 狀態型別
 */
export type GroupModalView = 'list' | 'create' | 'edit' | 'members';
```

### 自訂 Hooks

使用箭頭函式定義所有 hooks：

```typescript
// src/modules/groups/hooks/useGroups.ts

import { useState, useEffect } from 'react';
import type { Group, CreateGroupForm, UpdateGroupForm } from '../types/group.types';

/**
 * 群組資料管理 Hook
 */
export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // TODO: 實作 API 呼叫
      // const data = await groupsApi.getAll();
      // 目前使用 Mock 資料
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'My Home',
          admin: 'Jocelyn',
          members: [/* ... */],
          color: 'bg-red-100',
          characterColor: 'bg-red-400',
          plan: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // 其他群組...
      ];
      setGroups(mockGroups);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (form: CreateGroupForm) => {
    // TODO: 實作建立群組邏輯
  };

  const updateGroup = async (id: string, form: UpdateGroupForm) => {
    // TODO: 實作更新群組邏輯
  };

  const deleteGroup = async (id: string) => {
    // TODO: 實作刪除群組邏輯
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};
```

```typescript
// src/modules/groups/hooks/useGroupMembers.ts

import { useState, useCallback } from 'react';
import type { GroupMember, InviteMemberForm } from '../types/group.types';

/**
 * 群組成員管理 Hook
 */
export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: 實作 API 呼叫
      // const data = await groupsApi.getMembers(groupId);
      const mockMembers: GroupMember[] = [/* ... */];
      setMembers(mockMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const inviteMember = async (form: InviteMemberForm) => {
    // TODO: 實作邀請成員邏輯
  };

  const removeMember = async (memberId: string) => {
    // TODO: 實作移除成員邏輯
  };

  const updateMemberRole = async (memberId: string, role: GroupMember['role']) => {
    // TODO: 實作更新成員權限邏輯
  };

  return {
    members,
    isLoading,
    inviteMember,
    removeMember,
    updateMemberRole,
    refetch: fetchMembers,
  };
};
```

### 組件規範

所有組件都使用箭頭函式 + TypeScript：

```typescript
// src/modules/groups/components/ui/GroupCard.tsx

import type { FC } from 'react';
import type { Group } from '../../types/group.types';

type GroupCardProps = {
  group: Group;
  onEditMembers?: (group: Group) => void;
  onEditGroup?: (group: Group) => void;
}

/**
 * 群組卡片組件
 */
export const GroupCard: FC<GroupCardProps> = ({ 
  group, 
  onEditMembers, 
  onEditGroup 
}) => {
  return (
    <div className={`rounded-3xl p-4 border border-stone-100 shadow-sm ${group.color}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#EE5D50]">
            {group.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            管理員 {group.admin}
          </p>
        </div>
        <div className={`w-24 h-24 ${group.characterColor} rounded-full opacity-80 -mt-2 -mr-2`} />
      </div>
      
      {/* 成員區域 */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-xs text-stone-500 mr-2">
          成員 ({group.members.length})
        </span>
        <div className="flex -space-x-2">
          {group.members.map((member) => (
            <div 
              key={member.id} 
              className={`w-8 h-8 rounded-full border-2 border-white ${member.avatar}`} 
            />
          ))}
        </div>
      </div>
      
      {/* 操作按鈕 */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => onEditMembers?.(group)}
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-10 rounded-xl text-sm"
        >
          編輯成員
        </button>
        <button 
          onClick={() => onEditGroup?.(group)}
          className="w-full border border-stone-200 text-stone-700 h-10 rounded-xl text-sm bg-white hover:bg-stone-50"
        >
          修改群組內容
        </button>
      </div>
    </div>
  );
};
```

### Modal 組件範例

```typescript
// src/modules/groups/components/modals/GroupSettingsModal.tsx

import type { FC } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { GroupCard } from '../ui/GroupCard';
import { useGroups } from '../../hooks/useGroups';
import type { Group } from '../../types/group.types';

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onOpenMembersModal?: (group: Group) => void;
  onOpenEditModal?: (group: Group) => void;
  onOpenCreateModal?: () => void;
}

/**
 * 群組設定 Modal（群組列表管理）
 */
export const GroupSettingsModal: FC<GroupSettingsModalProps> = ({
  open,
  onClose,
  onOpenMembersModal,
  onOpenEditModal,
  onOpenCreateModal,
}) => {
  const { groups, isLoading } = useGroups();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>群組設定</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* 建立群組按鈕 */}
          <Button 
            className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
            onClick={onOpenCreateModal}
          >
            建立群組
          </Button>

          {/* 群組列表 */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm text-stone-500 font-medium">群組</h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-stone-400">載入中...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-stone-400">尚無群組</div>
            ) : (
              groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEditMembers={onOpenMembersModal}
                  onEditGroup={onOpenEditModal}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 實作步驟

### 階段一：基礎架構建立

1. **建立型別定義**
   - ✅ 在 `src/modules/groups/types/group.types.ts` 建立所有 TypeScript 型別
   - ✅ 確保所有型別都有適當的 JSDoc 註解

2. **建立 Hooks**
   - ✅ 實作 `useGroups` hook 處理群組 CRUD 操作
   - ✅ 實作 `useGroupMembers` hook 處理成員管理
   - ✅ 使用箭頭函式格式

3. **建立可重用 UI 組件**
   - ✅ 拆分 UI 組件：`GroupCard`、`MemberList`、`MemberItem` 等
   - ✅ 確保組件間低耦合、高內聚
   - ✅ 移植現有 [Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx) 和 [Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx) 的 UI 樣式

### 階段二：建立 Modal 組件

1. **群組設定 Modal** (`GroupSettingsModal.tsx`)
   - 顯示所有群組列表
   - 包含「建立群組」按鈕
   - 每個群組卡片可觸發編輯功能
   - 對應原 [Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx) 功能

2. **建立群組 Modal** (`CreateGroupModal.tsx`)
   - 群組名稱輸入
   - 顏色選擇
   - 角色圖示顏色選擇

3. **編輯群組 Modal** (`EditGroupModal.tsx`)
   - 修改群組名稱
   - 修改顏色配置
   - 刪除群組功能

4. **成員管理 Modal** (`MembersModal.tsx`)
   - 顯示群組資訊卡片
   - 成員列表
   - 邀請成員按鈕
   - 刪除成員功能
   - 對應原 [Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx) 功能

### 階段三：整合至 TopNav

1. **更新 TopNav 組件**
   - 新增 Modal 開啟狀態管理
   - 整合 `HousePlus` 按鈕觸發群組設定 Modal
   - 更新「+ 新增群組」選項觸發建立群組 Modal
   - 引入所需的 Modal 組件

2. **Modal 間的導航流程**
   - 群組設定 Modal → 建立群組 Modal
   - 群組設定 Modal → 成員管理 Modal
   - 群組設定 Modal → 編輯群組 Modal
   - 確保 Modal 間切換流暢，需要時關閉前一個 Modal

### 階段四：移除舊有路由結構

1. **移除路由配置**
   - 從 [index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx) 移除 `group` 路由

2. **刪除舊檔案**
   - 刪除 `src/routes/Group/Settings.tsx`
   - 刪除 `src/routes/Group/Members.tsx`
   - 刪除 `src/routes/Group/` 資料夾

3. **搜尋並移除相關引用**
   - 搜尋所有 `/group/settings` 和 `/group/members` 的引用
   - 移除或更新這些引用

### 階段五：資料同步與狀態管理

1. **整合群組選擇下拉選單**
   - TopNav 的群組選擇下拉選單應與 `useGroups` 同步
   - 選擇不同群組時更新全域狀態
   - 考慮使用 Context 或 Zustand 管理當前選中的群組

2. **Modal 資料更新**
   - 在 Modal 中建立/編輯/刪除群組後，自動更新群組列表
   - 確保 TopNav 的下拉選單即時反映變更

---

## 驗證計劃

### 功能測試

1. **TopNav 整合測試**
   - ✅ 點擊 `HousePlus` 按鈕能正確開啟群組設定 Modal
   - ✅ 點擊「+ 新增群組」能正確開啟建立群組 Modal
   - ✅ Modal 開啟時背景正確鎖定，無法捲動

2. **群組設定 Modal 測試**
   - ✅ 正確顯示所有群組卡片
   - ✅ 每個群組卡片樣式與原 [Settings.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Settings.tsx) 一致
   - ✅ 點擊「編輯成員」按鈕能開啟成員管理 Modal
   - ✅ 點擊「修改群組內容」按鈕能開啟編輯群組 Modal

3. **成員管理 Modal 測試**
   - ✅ 正確顯示群組資訊和成員列表
   - ✅ 樣式與原 [Members.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Group/Members.tsx) 一致
   - ✅ 「邀請好友」按鈕功能正常
   - ✅ 「刪除成員」功能正常

4. **建立/編輯群組 Modal 測試**
   - ✅ 表單驗證正常運作
   - ✅ 成功建立/編輯後關閉 Modal 並更新列表
   - ✅ 取消操作正確關閉 Modal

### 手動測試步驟

1. 啟動開發伺服器
2. 在任何頁面，觀察 TopNav 
3. 點擊右側 `HousePlus` 圖示按鈕，應開啟群組設定 Modal
4. 在 Modal 中點擊「建立群組」，應開啟建立群組 Modal
5. 填寫表單後提交，應成功建立群組並更新列表
6. 點擊任一群組的「編輯成員」，應開啟成員管理 Modal
7. 確認所有功能與原路由版本一致
8. 關閉所有 Modal，確認無記憶體洩漏或狀態殘留

---

## 檔案清理

### 待刪除檔案

- ✅ `src/routes/Group/Settings.tsx`
- ✅ `src/routes/Group/Members.tsx`
- ✅ `src/routes/Group/` 資料夾

### 待更新檔案

- ✅ `src/routes/index.tsx` → 移除 `group` 路由配置
- ✅ [TopNav.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx) → 整合 Modal 觸發邏輯

---

## 後續優化建議

1. **狀態管理整合**
   - 使用 Zustand 或 Context API 管理全域群組狀態
   - 管理當前選中的群組
   - 避免 prop drilling 問題

2. **API 整合**
   - 實作真實 API 呼叫取代 Mock 資料
   - 使用 React Query 或 SWR 進行資料快取和同步
   - 實作樂觀更新（Optimistic Updates）

3. **權限控制**
   - 實作基於角色的權限控制（RBAC）
   - 根據使用者角色顯示/隱藏特定操作
   - 擁有者、組織者、成員的權限區分

4. **使用者體驗優化**
   - 新增載入狀態動畫
   - 新增操作成功/失敗的 Toast 通知
   - 新增確認對話框（刪除群組/成員時）

5. **效能優化**
   - 使用 `React.memo` 避免不必要的重渲染
   - 實作虛擬滾動處理大量群組/成員
   - 延遲載入 Modal 組件（Code Splitting）

6. **可訪問性（A11y）**
   - 確保 Modal 符合 ARIA 規範
   - 鍵盤導航支援（ESC 關閉、Tab 切換）
   - 焦點管理（開啟 Modal 時焦點轉移）

---

## 總結

本規劃採用**模組化 Modal 組件方案**，將群組功能整合於 [TopNav](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx) 中，提供以下優勢：

- ✅ **不依賴路由**：完全模組化，可在任何位置重用
- ✅ **自然整合**：利用 TopNav 現有的 UI 元素（`HousePlus` 按鈕、下拉選單）
- ✅ **優秀的 UX**：使用者可隨時透過 TopNav 存取群組功能，無需導航
- ✅ **技術規範一致**：使用 TypeScript type、箭頭函式、模組化設計
- ✅ **可維護性高**：清晰的檔案結構和命名規範

所有實作都將遵循以下原則：

- ✅ 使用 TypeScript `type` 型別定義
- ✅ 使用箭頭函式格式
- ✅ 模組化、可重用的組件設計
- ✅ 清晰的檔案結構和命名規範
- ✅ 完整的繁體中文註解和文件

準備好後，即可進入實作階段！
