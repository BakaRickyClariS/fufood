# TopNav 組件修改實施計畫

本計畫旨在根據設計稿更新 TopNav 組件，提升視覺呈現並優化使用者體驗。

![設計稿參考](C:/Users/User/.gemini/antigravity/brain/8e1f6728-6a51-42c2-9a1d-76429e0cd258/uploaded_image_1765768284378.png)

## 目標概述

根據設計稿修改 `TopNav.tsx`，包含以下功能：
1. 左側顯示群組成員大頭貼（最多 3 個，超過用點點圖示）
2. myHome 按鈕添加橢圓底色樣式
3. myHome 點擊視窗改為從下方彈出（類似 FilterModal）
4. 右側大頭貼新增會員等級徽章定位
5. 更換群組編輯按鈕圖示
6. 串接 API 時的會員等級處理規劃

## 使用者審核項目

> [!IMPORTANT]
> **會員等級 API 整合**
> 
> 目前計畫在 User 型別中新增 `membershipTier` 欄位，用於判斷顯示哪個會員等級圖示。請確認：
> - API 是否會提供會員等級資訊？若有，欄位名稱為何？
> - 會員等級有哪些等級？（目前假設：free, premium, vip）
> - 圖示檔案是否需要準備多個等級的版本？（目前只有 Premium-membership-card.png）

> [!WARNING]
> **群組成員資料來源**
> 
> 左側成員大頭貼需要顯示當前選中群組的成員列表。目前 TopNav 沒有群組上下文，計畫透過以下方式處理：
> - 使用 `useGroups` hook 取得當前選中的群組
> - 若尚未實作群組選擇邏輯，將先使用 mock 資料
> 
> 請確認是否符合預期的實作方式。

---

## 修改項目

### 型別定義

#### [NEW] [user.types.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/auth/types/user.types.ts)

在 `User` 型別中新增會員等級欄位：

```typescript
type MembershipTier = 'free' | 'premium' | 'vip';

export type User = {
  // ... 現有欄位
  membershipTier?: MembershipTier; // 會員等級
};
```

---

### 共用組件

#### [NEW] [HomeModal](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/HomeModal.tsx)

建立從下方彈出的 Home 選單 Modal，參考 `FilterModal.tsx` 的動畫實現：

**功能特點**：
- 使用 GSAP 實現從下方滑入/滑出動畫
- 顯示當前使用者資訊
- 顯示群組成員列表
- 提供「編輯成員」按鈕

**Props 介面**：
```typescript
type HomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    avatar: string;
    role: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  onEditMembers: () => void;
};
```

**樣式規範**：
- 背景遮罩：`bg-black/60 backdrop-blur-sm`
- 內容區：白色背景，頂部圓角 `rounded-t-3xl`
- 最大高度：`max-h-[90vh]`

---

#### [NEW] [MemberAvatars](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/ui/MemberAvatars.tsx)

建立成員大頭貼群組顯示組件：

**功能特點**：
- 最多顯示 3 個成員大頭貼
- 超過 3 個用「...」點點圖示表示
- 若成員不滿 3 個則空白（不顯示佔位符）

**Props 介面**：
```typescript
type MemberAvatarsProps = {
  members: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  maxDisplay?: number; // 預設 3
};
```

**樣式規範**：
- 大頭貼尺寸：`w-10 h-10`
- 圓形：`rounded-full`
- 重疊排列：每個向左偏移一定距離
- 超過數量指示器：使用圓形灰底 + 三個點

---

#### [NEW] [MembershipBadge](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/ui/MembershipBadge.tsx)

建立會員等級徽章組件：

**功能特點**：
- 根據會員等級顯示對應圖示
- 絕對定位於大頭貼左下角

**Props 介面**：
```typescript
type MembershipBadgeProps = {
  tier: 'free' | 'premium' | 'vip';
  size?: 'sm' | 'md'; // 預設 'sm'
};
```

**樣式規範**：
- 位置：`absolute bottom-0 left-0`
- 尺寸（sm）：`w-4 h-4`
- 圖示來源：`src/assets/images/nav/Premium-membership-card.png`

---

### 佈局組件

#### [MODIFY] [TopNav](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/TopNav.tsx)

更新 TopNav 組件以符合設計稿：

**1. 左側成員大頭貼區塊**（第 94-100 行）

移除原本的 Free Badge，改為顯示成員大頭貼：

```diff
- {/* Free Badge */}
- <div className="flex items-center gap-1 bg-[#C48B6B] text-white px-2 py-1 rounded-md shadow-sm">
-   <ShieldCheck className="w-4 h-4 text-white" />
-   <span className="text-xs font-bold">Free</span>
- </div>
+ {/* 成員大頭貼 */}
+ <MemberAvatars members={currentGroupMembers} maxDisplay={3} />
```

**2. myHome 按鈕樣式**（第 103-112 行）

添加橢圓底色樣式：

```diff
  <Button
    variant="ghost"
-   className="flex items-center gap-1 text-xl font-bold text-neutral-900 px-0 hover:bg-transparent"
+   className="flex items-center gap-1 text-xl font-bold text-primary-700 px-4 py-2 bg-primary-100 rounded-full hover:bg-primary-200"
  >
    {selectedHome}
    <ChevronDown className="w-5 h-5" />
  </Button>
```

**3. 彈出視窗改為 HomeModal**（第 113-177 行）

移除原本的 `DropdownMenuContent`，改用新建的 `HomeModal`：

```diff
- <DropdownMenuContent align="start" className="w-64 p-4 rounded-2xl">
-   {/* 原有內容 */}
- </DropdownMenuContent>
+ {/* Modal 移到底部統一管理 */}
```

在組件底部新增：

```typescript
<HomeModal
  isOpen={isHomeModalOpen}
  onClose={() => setIsHomeModalOpen(false)}
  currentUser={{
    name: userName,
    avatar: userAvatar,
    role: '擁有者',
  }}
  members={currentGroupMembers}
  onEditMembers={() => {
    setIsHomeModalOpen(false);
    handleOpenMembers(currentGroup);
  }}
/>
```

**4. 群組編輯按鈕圖示**（第 183-190 行）

更換為新的 SVG 圖示：

```diff
+ import EditGroupIcon from '@/assets/images/nav/edit-group.svg';

  <Button
    variant="ghost"
    size="icon"
    className="text-neutral-900 hover:bg-transparent"
    onClick={() => setIsSettingsOpen(true)}
  >
-   <HousePlus className="w-6 h-6" />
+   <img src={EditGroupIcon} alt="編輯群組" className="w-6 h-6" />
  </Button>
```

**5. 大頭貼會員等級徽章**（第 192-198 行）

在大頭貼外層加上相對定位，內部添加徽章：

```diff
- <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
+ <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative">
    <img
      src={userAvatar}
      alt={userName}
      className="w-full h-full object-cover"
    />
+   <MembershipBadge tier={user?.membershipTier || 'free'} size="sm" />
  </div>
```

**6. 狀態管理**

新增 HomeModal 開關狀態：

```typescript
const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
```

更新按鈕點擊事件：

```diff
- <DropdownMenuTrigger asChild>
+ <div onClick={() => setIsHomeModalOpen(true)}>
    <Button ...>
      ...
    </Button>
+ </div>
- </DropdownMenuTrigger>
```

**7. 取得當前群組資料**

使用 `useGroups` hook 取得當前群組與成員：

```typescript
import { useGroups } from '@/modules/groups';

const { groups } = useGroups();
const currentGroup = groups[0] || null; // 暫時使用第一個群組
const currentGroupMembers = currentGroup?.members || [];
```

---

## 驗證計畫

### 開發環境測試

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **視覺驗證項目**
   - [ ] 左側成員大頭貼正確顯示（最多 3 個）
   - [ ] 超過 3 個成員時顯示「...」點點圖示
   - [ ] myHome 按鈕有 primary-100 橢圓底色
   - [ ] myHome 按鈕文字為 primary-700 顏色
   - [ ] 點擊 myHome 按鈕時，視窗從下方彈出
   - [ ] HomeModal 動畫流暢（GSAP 滑入/滑出）
   - [ ] 右側大頭貼左下角顯示會員等級徽章
   - [ ] 群組編輯按鈕使用新的 SVG 圖示

3. **功能驗證項目**
   - [ ] HomeModal 顯示當前使用者資訊
   - [ ] HomeModal 顯示所有群組成員
   - [ ] 點擊「編輯成員」按鈕正確開啟 MembersModal
   - [ ] 點擊遮罩或關閉按鈕可關閉 HomeModal

### 手動測試步驟

1. 開啟瀏覽器，進入首頁
2. 觀察 TopNav 左側是否顯示成員大頭貼
3. 觀察 myHome 按鈕樣式是否符合設計稿
4. 點擊 myHome 按鈕，確認視窗從下方彈出
5. 觀察彈出視窗內容是否正確
6. 觀察右側大頭貼是否有會員等級徽章
7. 觀察群組編輯按鈕圖示是否正確

### 文件更新

完成實作後更新以下文件：

- [ ] `src/modules/groups/README.md`：補充 HomeModal 與成員顯示邏輯
- [ ] `docs/backend/groups_api_spec.md`：說明會員等級 API 欄位需求
- [ ] `src/modules/API_REFERENCE_V2.md`：補充 User 型別的 `membershipTier` 欄位說明
