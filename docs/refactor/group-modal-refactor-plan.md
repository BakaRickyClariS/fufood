# Group 模組 Modal 元件重構計劃

> **最後更新**: 2025-12-17
> **狀態**: 待審核

## 目標說明

根據提供的設計稿，重構 `groups` 模組中的 Modal 相關元件，主要包含以下修改：

1. 將 `HomeModal` 從 `shared` 模組移動至 `groups` 模組
2. 更新 `GroupCard` 加入下拉展開功能
3. 更新 `MembersModal` 的大頭貼、群組圖片以及刪除成員流程

---

## 設計稿參考

### 圖一：HomeModal（群組成員列表）

![HomeModal 設計稿](file:///C:/Users/USER/.gemini/antigravity/brain/82ee2c7f-3180-40c3-906a-53c9e008095d/uploaded_image_0_1765976011204.png)

**設計重點**：

- 顯示成員列表（大頭貼 + 名稱 + 角色）
- 當前使用者標記「(你)」
- 角色顯示：擁有者、組織者
- 底部「編輯成員」按鈕

---

### 圖二：GroupCard（群組卡片）

![GroupCard 設計稿](file:///C:/Users/USER/.gemini/antigravity/brain/82ee2c7f-3180-40c3-906a-53c9e008095d/uploaded_image_1_1765976011204.png)

**設計重點**：

- 群組名稱（紅色）+ 管理員資訊
- 群組插圖（使用提供的圖片）
- 成員頭像堆疊顯示
- **下拉按鈕**：點擊當前群組卡片才會展開顯示操作按鈕
- 展開後顯示：「編輯成員」與「修改群組內容」按鈕

---

### 圖三：MembersModal（編輯成員 Modal）

![MembersModal 設計稿](file:///C:/Users/USER/.gemini/antigravity/brain/82ee2c7f-3180-40c3-906a-53c9e008095d/uploaded_image_2_1765976011204.png)

**設計重點**：

- 群組資訊卡（Free 標籤 + 名稱 + 管理員 + 群組插圖）
- 成員數量標題 + 右側「刪除成員」文字按鈕
- 成員列表（大頭貼 + 名稱 + 角色）
- **刪除流程**：必須先點擊「刪除成員」才會出現垃圾桶圖示
- 底部「邀請好友」按鈕

---

## 使用套件

專案現有套件（本次修改將使用）：

| 套件                     | 用途                      |
| ------------------------ | ------------------------- |
| `@tanstack/react-query`  | API 資料管理（必須使用）  |
| `gsap`                   | 動畫效果（展開/收合動畫） |
| `@radix-ui/react-dialog` | Modal 基礎元件            |
| `lucide-react`           | 圖示                      |
| `react-hook-form`        | 表單處理（如需要）        |

---

## 可用資源

### 群組圖片

路徑：`src/assets/images/group/`

| 檔案     | 用於群組          |
| -------- | ----------------- |
| `jo.png` | My Home (Jocelyn) |
| `ko.png` | R Home (Ricky)    |
| `zo.png` | Z Home (Zoe)      |

---

## 詳細修改項目

### [Component 1] HomeModal 重構

#### [DELETE] [HomeModal.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/HomeModal.tsx)

從 `shared` 模組刪除此檔案。

---

#### [NEW] [HomeModal.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/components/modals/HomeModal.tsx)

新增至 `groups` 模組的 `modals` 資料夾。

**修改內容**：

- 更換成員大頭貼使用實際圖片
- 調整版面配置符合設計稿
- 加入假資料（Jocelyn, Zoe, Ricky）

**假資料範例**：

```typescript
const mockMembers = [
  { id: '1', name: 'Jocelyn', role: 'owner', avatar: joAvatar },
  { id: '2', name: 'Zoe', role: 'organizer', avatar: zoeAvatar },
  { id: '3', name: 'Ricky', role: 'organizer', avatar: rickyAvatar },
];
```

---

### [Component 2] GroupCard 重構

#### [MODIFY] [GroupCard.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/components/ui/GroupCard.tsx)

**新增功能**：

1. **展開/收合狀態管理**
   - 新增 `isExpanded` state
   - 點擊下拉箭頭按鈕切換展開狀態

2. **下拉按鈕**
   - 使用 `ChevronDown` 圖示
   - 點擊時使用 GSAP 旋轉動畫

3. **操作按鈕區域**
   - 預設隱藏
   - 展開時使用 GSAP 滑入動畫顯示
   - 包含「編輯成員」與「修改群組內容」兩個按鈕

4. **群組圖片**
   - 替換 placeholder 圓形為實際群組圖片
   - 根據群組 ID 或名稱映射對應圖片

**修改後結構**：

```tsx
<div className="group-card">
  {/* 群組資訊區 */}
  <div className="group-header">
    <div className="group-info">
      <h3>My Home</h3>
      <p>管理員 Jocelyn</p>
    </div>
    <img src={groupImage} alt="群組圖片" />
  </div>

  {/* 成員區 */}
  <div className="members-section">
    <span>成員 (3)</span>
    <div className="avatar-stack">...</div>
  </div>

  {/* 下拉箭頭 */}
  <button className="expand-button" onClick={toggleExpand}>
    <ChevronDown className={isExpanded ? 'rotate-180' : ''} />
  </button>

  {/* 操作按鈕（展開時顯示）*/}
  {isExpanded && (
    <div className="action-buttons">
      <Button>編輯成員</Button>
      <Button>修改群組內容</Button>
    </div>
  )}
</div>
```

---

### [Component 3] MembersModal 重構

#### [MODIFY] [MembersModal.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/components/modals/MembersModal.tsx)

**修改內容**：

1. **群組圖片連動**
   - 根據選取的群組動態載入對應圖片
   - 擴展 `Group` type 新增 `imageUrl` 欄位或使用映射

2. **成員大頭貼更換**
   - 使用實際頭像圖片而非 placeholder

3. **刪除成員流程**
   - 新增 `isDeleteMode` state
   - 點擊「刪除成員」按鈕進入刪除模式
   - 刪除模式下每個成員項目顯示垃圾桶圖示
   - 點擊垃圾桶才能移除成員
   - 再次點擊「刪除成員」退出刪除模式（或切換為「完成」）

**修改後狀態管理**：

```typescript
const [isDeleteMode, setIsDeleteMode] = useState(false);

const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);
```

---

#### [MODIFY] [MemberItem.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/components/ui/MemberItem.tsx)

**修改內容**：

1. **頭像顯示**
   - 從 CSS class placeholder 改為 `<img>` 實際圖片

2. **刪除按鈕條件顯示**
   - 新增 `showDeleteButton` prop
   - 只有 `showDeleteButton` 為 true 時顯示垃圾桶

**介面更新**：

```typescript
type MemberItemProps = {
  member: GroupMember;
  onRemove?: (memberId: string) => void;
  showDeleteButton?: boolean; // 新增
  isCurrentUser?: boolean; // 新增：標記當前使用者
};
```

---

### [Component 4] Type 更新（可選）

#### [MODIFY] [group.types.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/types/group.types.ts)

**修改內容**：

新增 `imageUrl` 欄位支援群組圖片：

```typescript
export type Group = {
  id: string;
  name: string;
  admin: string;
  members: GroupMember[];
  color: string;
  characterColor: string;
  imageUrl?: string; // 新增：群組圖片 URL
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
};
```

---

### [Component 5] Hooks 重構（可選）

#### [MODIFY] [useGroupMembers.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/hooks/useGroupMembers.ts)

**修改內容**：

- 改用 `@tanstack/react-query` 的 `useQuery` 和 `useMutation`
- 替換現有的 `useState` + `useEffect` 模式

> [!NOTE]
> 此修改為可選項目。目前 hook 功能正常運作，若時程緊迫可保持現狀。但建議未來統一使用 tanstack-query 管理伺服器狀態。

---

## 假資料規劃

### 成員資料

```typescript
// src/modules/groups/mocks/mockMembers.ts
import joAvatar from '@/assets/images/group/jo.png';
import koAvatar from '@/assets/images/group/ko.png';
import zoAvatar from '@/assets/images/group/zo.png';

export const mockAvatars = {
  jocelyn: joAvatar,
  ricky: koAvatar,
  zoe: zoAvatar,
};

export const mockMembers: GroupMember[] = [
  { id: '1', name: 'Jocelyn', role: 'owner', avatar: joAvatar },
  { id: '2', name: 'Zoe', role: 'organizer', avatar: zoAvatar },
  { id: '3', name: 'Ricky', role: 'organizer', avatar: koAvatar },
];
```

### 群組資料

```typescript
export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: mockMembers,
    color: 'bg-white',
    characterColor: 'bg-primary-200',
    imageUrl: joAvatar,
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... R Home, Z Home
];
```

---

## 檔案變更摘要

| 操作 | 檔案路徑                                                     |
| ---- | ------------------------------------------------------------ |
| 刪除 | `src/shared/components/layout/HomeModal.tsx`                 |
| 新增 | `src/modules/groups/components/modals/HomeModal.tsx`         |
| 修改 | `src/modules/groups/components/ui/GroupCard.tsx`             |
| 修改 | `src/modules/groups/components/modals/MembersModal.tsx`      |
| 修改 | `src/modules/groups/components/ui/MemberItem.tsx`            |
| 可選 | `src/modules/groups/types/group.types.ts`                    |
| 可選 | `src/modules/groups/hooks/useGroupMembers.ts`                |
| 新增 | `src/modules/groups/mocks/mockData.ts`（假資料）             |
| 修改 | `src/modules/groups/README.md`（更新文件）                   |
| 修改 | `docs/backend/groups_api_spec.md`（更新 API 規格）           |
| 修改 | `src/shared/components/layout/TopNav.tsx`（移除 Modal 邏輯） |
| 新增 | `src/modules/groups/providers/GroupModalProvider.tsx`        |
| 新增 | `src/modules/groups/hooks/useGroupModal.ts`                  |

---

## 文件更新項目

完成元件修改後，需同步更新以下文件：

### [MODIFY] [README.md](file:///d:/Work/Course/HexSchool/fufood/src/modules/groups/README.md)

**需更新內容**：

1. **目錄結構**（第 28-43 行）- 新增 `mocks/mockData.ts`

2. **型別定義**（第 49-72 行）- 新增 `Group.imageUrl?: string`

3. **TopNav 整合段落**（第 159-191 行）
   - 更新 `HomeModal` 路徑為 `@/modules/groups/components/modals/HomeModal.tsx`

---

### [MODIFY] [groups_api_spec.md](file:///d:/Work/Course/HexSchool/fufood/docs/backend/groups_api_spec.md)

**需更新內容**：

1. **Group 型別**（第 20-30 行）- 新增 `imageUrl?: string` 欄位
2. **版本號更新** - 更新為 v1.1

---

## TopNav Modal 邏輯重構（架構優化）

> [!WARNING]
> 此為肉宅反饋建議：TopNav 包含太多 Modal 邏輯，應抽離以保持元件單一職責。

### 現況分析

目前 [TopNav.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx) 包含：

| 項目         | 內容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| Modal 狀態   | `isHomeModalOpen`, `isSettingsOpen`, `isCreateOpen`, `isEditOpen`, `isMembersOpen`      |
| Modal 元件   | `HomeModal`, `GroupSettingsModal`, `CreateGroupModal`, `EditGroupModal`, `MembersModal` |
| Mock 資料    | `mockGroupMembers`, `currentGroup`                                                      |
| Handler 函數 | `handleOpenCreate`, `handleOpenEdit`, `handleOpenMembers`, `handleBackToSettings`       |

### 建議重構方案

**方案一：Hook + Provider（推薦）**

建立 `GroupModalProvider` 與 `useGroupModal` hook，將 Modal 狀態與邏輯抽至 Layout 層級：

```typescript
// src/modules/groups/providers/GroupModalProvider.tsx
export const GroupModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({...});
  // ... modal logic
  return (
    <GroupModalContext.Provider value={...}>
      {children}
      {/* 所有 Group Modals 在此渲染 */}
    </GroupModalContext.Provider>
  );
};

// Hook 用於任何需要開啟 Modal 的地方
export const useGroupModal = () => useContext(GroupModalContext);
```

**方案二：獨立 Route**

將群組設定相關功能改為獨立頁面路由，使用全螢幕 Modal 風格。

### 修改內容

#### [MODIFY] [TopNav.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/layout/TopNav.tsx)

- 移除所有 Modal 狀態和元件渲染
- 改用 `useGroupModal` hook 控制 Modal 開啟

#### [NEW] GroupModalProvider.tsx

路徑: `src/modules/groups/providers/GroupModalProvider.tsx`

- 集中管理所有 Group Modal 狀態
- 提供 `openSettings`, `openCreate`, `openEdit`, `openMembers` 等方法

#### [NEW] useGroupModal.ts

路徑: `src/modules/groups/hooks/useGroupModal.ts`

- 封裝 Modal 操作介面

### 視覺驗證

1. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

2. **檢查 GroupCard 展開功能**
   - 開啟群組設定頁面
   - 點擊群組卡片下拉箭頭
   - 確認動畫平滑展開
   - 確認「編輯成員」與「修改群組內容」按鈕顯示

3. **檢查 MembersModal 刪除流程**
   - 點擊「編輯成員」開啟 Modal
   - 確認成員列表顯示正確頭像
   - 點擊「刪除成員」
   - 確認垃圾桶圖示出現
   - 確認可點擊垃圾桶移除成員

4. **檢查圖片顯示**
   - 群組卡片顯示正確的群組圖片
   - 成員 Modal 顯示正確頭像

### 手動測試清單

- [ ] 群組卡片預設收合狀態
- [ ] 點擊展開箭頭正確展開
- [ ] 展開動畫流暢
- [ ] 「編輯成員」按鈕正常開啟 Modal
- [ ] 成員 Modal 正確顯示群組資訊
- [ ] 刪除模式正確切換
- [ ] 刪除成員功能正常運作
- [ ] 所有圖片正確載入無破圖

---

## 已確認事項

1. **群組圖片映射邏輯**：依據群組 ID 映射對應圖片

2. **刪除模式 UI**：進入刪除模式後按鈕文字顯示「完成」

3. **HomeModal 使用場景**：點擊 TopNav 的 MyHome 按鈕開啟

4. **資料管理策略**：
   - 優先實作真實 API 整合
   - 假資料與真實資料連動
   - 支援 `VITE_USE_MOCK_API` 環境變數切換

---

## 資料管理架構

### API + Mock 切換機制

```typescript
// src/modules/groups/api/groupsApi.ts
import { mockGroupsApi } from '../mocks/groupsMockApi';
import { realGroupsApi } from './realGroupsApi';

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

export const groupsApi = useMockApi ? mockGroupsApi : realGroupsApi;
```

### 假資料連動

Mock 資料需與真實 API 回傳格式完全一致，並包含：

- 群組圖片 URL（依據群組 ID）
- 成員頭像 URL
- 完整的 Group 和 GroupMember 型別
