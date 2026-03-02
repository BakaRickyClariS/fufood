# Planning Module (共享規劃模組)

## 📋 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [Hooks 詳解](#hooks-詳解)
- [Context 狀態管理](#context-狀態管理)
- [元件結構](#元件結構)
- [路由設定](#路由設定)
- [環境變數設定](#環境變數設定)
- [Mock 資料](#mock-資料)

---

## 概述

本模組負責**共享規劃**功能，讓群組成員可以共同編輯購物清單，並透過貼文牆形式分享購買建議。整合 Recipe 模組提供食譜推薦功能。

### 核心功能
1.  **共享清單管理**: 建立、編輯、刪除共享購物清單
2.  **貼文牆**: 群組成員可在清單內發布、編輯、刪除購買建議貼文
3.  **狀態追蹤**: 進行中 / 待採買 / 已完成
4.  **食譜推薦**: 整合 Recipe 模組的食譜瀏覽功能
5.  **Mock 模式**: 支援離線開發與測試（localStorage 持久化）
6.  **圖片上傳**: 支援購物項目照片上傳（整合 Media 模組）

---

## 目錄結構

```
planning/
├── components/               # UI 元件
│   ├── features/            # 業務功能視圖
│   │   ├── SharedPlanningList.tsx  # 共享清單列表 (含篩選、刪除)
│   │   ├── SharedListDetail.tsx    # 清單詳情頁 (貼文牆)
│   │   ├── CreatePost.tsx          # 建立/編輯貼文表單
│   │   └── CreateSharedListDrawer.tsx # 建立清單抽屜 (Portal + GSAP)
│   ├── layout/              # 版面配置
│   │   └── PlanningTabsSection.tsx # Tab 導航
│   └── ui/                  # 基礎元件
│       ├── SharedListCard.tsx      # 清單預覽卡片 (含編輯/刪除選單)
│       ├── PostCard.tsx            # 貼文卡片 (含展開圖片、編輯/刪除)
│       ├── CoverImagePicker.tsx    # 封面選擇器 (Sheet)
│       ├── MonthTimelinePicker.tsx # 月份時間軸選擇器
│       └── ShoppingItemEditor.tsx  # 購物項目動態編輯器
├── contexts/                 # Context 狀態管理
│   └── SharedListsContext.tsx      # 共享清單狀態共享
├── hooks/                    # 自定義 Hooks
│   ├── useSharedLists.ts    # 共享清單管理 (CRUD + Optimistic Update)
│   └── usePosts.ts          # 貼文管理 (CRUD)
├── services/                 # 服務層
│   ├── api/
│   │   └── sharedListApi.ts # API 介面定義與 Real API 實作
│   └── mock/
│       ├── mockSharedListApi.ts  # Mock API 實作
│       └── mockSharedListData.ts # Mock 資料
├── types/                    # TypeScript 型別
│   ├── index.ts             # 型別匯出
│   ├── sharedList.ts        # 共享清單型別
│   └── post.ts              # 貼文、購物項目型別
├── constants/                # 常數定義
│   └── coverImages.ts       # 預設封面圖
└── README.md
```

---

## 型別定義 (Types)

### SharedList (共享清單)
```typescript
export type SharedListStatus = 'in-progress' | 'pending-purchase' | 'completed';

export type SharedList = {
  id: string;
  name: string;
  coverImageUrl: string;
  scheduledDate: string;           // 預計採買日期 ISO String
  status: SharedListStatus;
  notifyEnabled: boolean;
  groupId: string;                 // 所屬群組
  createdAt: string;
  updatedAt?: string;
};

export type SharedListItem = Pick<
  SharedList,
  'id' | 'name' | 'coverImageUrl' | 'scheduledDate' | 'status'
>;

export type CreateSharedListInput = {
  name: string;
  coverImageUrl: string;
  scheduledDate: string;
  notifyEnabled: boolean;
  groupId: string;
};
```

### SharedListPost (貼文)
```typescript
export type SharedListPost = {
  id: string;
  listId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;              // 說明文字（最多40字）
  images: string[];             // 商品照片 URLs
  items: ShoppingItem[];        // 購物明細
  createdAt: string;
};

export type CreatePostInput = {
  listId: string;
  content: string;
  images: string[];
  items: ShoppingItem[];
};
```

### ShoppingItem (購物項目)
```typescript
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  imageUrl?: string;            // 商品照片 URL
};
```

---

## API 規格

根據 [shopping_lists_api_spec.md](../../../docs/backend/shopping_lists_api_spec.md)：

| #  | Method | API Path | 功能說明 | 狀態 |
|----|--------|----------|---------|------|
| 1 | GET | `/api/v1/shopping-lists` | 取得清單列表（支援 `year/month` 查詢） | ✅ 已實作 |
| 2 | POST | `/api/v1/shopping-lists` | 建立購物清單 | ✅ 已實作 |
| 3 | GET | `/api/v1/shopping-lists/{id}` | 取得單一清單詳情 | ✅ 已實作 |
| 4 | PATCH | `/api/v1/shopping-lists/{id}` | 編輯清單或標記 `{ status: 'purchased' }` | 🔜 待實作 |
| 5 | DELETE | `/api/v1/shopping-lists/{id}` | 刪除購物清單 | ✅ 已實作 |
| 6 | GET | `/api/v1/shopping-lists/{id}/posts` | 取得清單貼文 | ✅ 已實作 |
| 7 | POST | `/api/v1/shopping-lists/{id}/posts` | 建立清單貼文 | ✅ 已實作 |
| 8 | DELETE | `/api/v1/posts/{postId}` | 刪除貼文 | ✅ 已實作 |
| 9 | PUT | `/api/v1/posts/{postId}` | 更新貼文 | ✅ 已實作 |

### SharedListApi 介面
```typescript
export type SharedListApi = {
  // 共享清單 CRUD
  getSharedLists(year?: number, month?: number): Promise<SharedListItem[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(input: CreateSharedListInput): Promise<SharedList>;
  deleteSharedList(id: string): Promise<void>;

  // 貼文 CRUD
  getPosts(listId: string): Promise<SharedListPost[]>;
  createPost(input: CreatePostInput): Promise<SharedListPost>;
  deletePost(postId: string, listId: string): Promise<void>;
  updatePost(postId: string, listId: string, input: CreatePostInput): Promise<SharedListPost>;
};
```

---

## Hooks 詳解

### `useSharedLists.ts`
```typescript
// 清單列表管理
export const useSharedLists = (year?: number, month?: number) => {
  return {
    lists: SharedListItem[];          // 清單列表
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;     // 重新載入
    createList: (input: CreateSharedListInput) => Promise<SharedList>;
    deleteList: (id: string) => Promise<void>;  // Optimistic Update
  };
};

// 單一清單詳情
export const useSharedListDetail = (id: string | undefined) => {
  return {
    list: SharedList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  };
};
```

### `usePosts.ts`
```typescript
export const usePosts = (listId: string | undefined) => {
  return {
    posts: SharedListPost[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createPost: (input: CreatePostInput) => Promise<SharedListPost>;
    updatePost: (postId: string, input: CreatePostInput) => Promise<SharedListPost>;
    deletePost: (postId: string) => Promise<void>;
  };
};
```

---

## Context 狀態管理

### `SharedListsContext.tsx`
用於在元件樹中共享 `useSharedLists` 的狀態，避免重複 API 呼叫。

```typescript
// Provider 包裝
<SharedListsProvider value={useSharedLists()}>
  {children}
</SharedListsProvider>

// 子元件取用
const { lists, isLoading, createList, deleteList } = useSharedListsContext();
```

---

## 元件結構

| 分類 | 元件 | 說明 |
|------|------|------|
| **Features** | `SharedPlanningList.tsx` | 清單列表，依狀態/年月篩選，整合刪除功能 |
| **Features** | `SharedListDetail.tsx` | 清單詳情頁，貼文牆展示，貼文 CRUD |
| **Features** | `CreatePost.tsx` | 貼文表單，支援建立/編輯模式，批量圖片上傳 |
| **Features** | `CreateSharedListDrawer.tsx` | 建立清單抽屜，使用 Portal + GSAP 動畫 |
| **Layout** | `PlanningTabsSection.tsx` | 主/副 Tab 導航 |
| **UI** | `SharedListCard.tsx` | 清單預覽卡片，含編輯/刪除下拉選單 |
| **UI** | `PostCard.tsx` | 貼文展示卡片，可展開商品圖片，含編輯/刪除 |
| **UI** | `CoverImagePicker.tsx` | 封面圖片選擇器 (Sheet) |
| **UI** | `MonthTimelinePicker.tsx` | 月份時間軸水平滑動選擇器 |
| **UI** | `ShoppingItemEditor.tsx` | 購物項目動態編輯器 |

---

## 路由設定

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/planning` | PlanningHome | 主頁 (雙 Tab: 共享規劃 / 食譜推薦) |
| `/planning?tab=planning` | PlanningHome | 共享規劃 Tab |
| `/planning?tab=recipes` | PlanningHome | 食譜推薦 Tab |
| `/planning/list/:listId` | SharedListDetail | 清單詳情頁 (貼文牆) |
| `/planning/list/:listId/edit` | — | 編輯清單 (待實作) |
| `/planning/recipes/:id` | RecipeDetailView | 食譜詳情 (from Recipe module) |
| `/planning/recipes/ai-query` | AIQueryModal | AI 查詢 Modal |

> **注意**: 建立清單已改為使用 `CreateSharedListDrawer` 抽屜元件，不再需要獨立路由。

---

## 環境變數設定

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | 後端 API 網址 | `http://localhost:3000` |

---

## Mock 資料

Mock 資料位於 `services/mock/`，使用 `localStorage` 模擬資料持久化（備援為記憶體快取）：

| Storage Key | 說明 |
|-------------|------|
| `mock_shared_lists` | 共享清單列表 |
| `mock_posts` | 清單貼文 (以 listId 為 key) |

### Mock API 能力
- ✅ 完整 CRUD（清單、貼文）
- ✅ 年月篩選
- ✅ `testReset()` 方法用於測試重置

### 預設測試資料
包含 4 個共享清單範例（LOPIA買都買、爆買Costco、去日本買什麼、家樂福熱食好吃）與多則貼文。
