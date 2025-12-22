# Planning Module (共享規劃模組)

## 📋 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [Hooks 詳解](#hooks-詳解)
- [元件結構](#元件結構)
- [路由設定](#路由設定)
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責**共享規劃**功能，讓群組成員可以共同編輯購物清單，並透過貼文牆形式分享購買建議。整合 Recipe 模組提供食譜推薦功能。

### 核心功能
1.  **共享清單管理**: 建立、編輯共享購物清單
2.  **貼文牆**: 群組成員可在清單內發布購買建議貼文
3.  **狀態追蹤**: 進行中 / 待採買 / 已完成
4.  **互動功能**: 按讚、留言 (規劃中)
5.  **食譜推薦**: 整合 Recipe 模組的食譜瀏覽功能
6.  **Mock 模式**: 支援離線開發與測試

---

## 目錄結構

```
planning/
├── components/               # UI 元件
│   ├── features/            # 業務功能視圖
│   │   ├── SharedPlanningList.tsx  # 共享清單列表
│   │   ├── SharedListDetail.tsx    # 清單詳情 (貼文牆)
│   │   └── CreatePost.tsx          # 建立貼文
│   ├── layout/              # 版面配置
│   │   └── PlanningTabsSection.tsx # Tab 導航
│   └── ui/                  # 基礎元件
│       ├── SharedListCard.tsx      # 清單卡片
│       ├── PostCard.tsx            # 貼文卡片
│       ├── CoverImagePicker.tsx    # 封面選擇器
│       └── ShoppingItemEditor.tsx  # 購物項目編輯器
├── hooks/                    # 自定義 Hooks
│   ├── useSharedLists.ts    # 共享清單管理
│   └── usePosts.ts          # 貼文管理
├── services/                 # 服務層
│   ├── api/
│   │   └── sharedListApi.ts # API 介面與切換邏輯
│   └── mock/
│       ├── mockSharedListApi.ts  # Mock API 實作
│       └── mockSharedListData.ts # Mock 資料
├── types/                    # TypeScript 型別
│   ├── index.ts             # 型別匯出
│   ├── sharedList.ts        # 共享清單型別
│   └── post.ts              # 貼文型別
├── constants/                # 常數定義
│   └── coverImages.ts       # 預設封面圖
└── README.md
```

---

## 型別定義 (Types)

### SharedList (共享清單)
```typescript
export type SharedList = {
  id: string;
  name: string;                    // 清單名稱
  coverImageUrl: string;           // 封面圖片
  scheduledDate: string;           // 預計採買日期
  status: SharedListStatus;        // 狀態
  notifyEnabled: boolean;          // 開啟通知
  groupId: string;                 // 所屬群組
  createdAt: string;
  updatedAt?: string;
};

export type SharedListStatus = 'in-progress' | 'pending-purchase' | 'completed';
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
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
};
```

### ShoppingItem (購物項目)
```typescript
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
};
```

---

## API 規格

根據 [API_REFERENCE_V2.md](../API_REFERENCE_V2.md) 條目 #41-#50（Shopping Lists），並改用 PATCH 流程取代舊 `/purchase`：

| #  | Method | API Path | 功能說明 | 備註 |
|----|--------|----------|---------|------|
| 41 | GET | `/api/v1/shopping-lists` | 取得所有購物清單（支援 `year/month` 查詢） | — |
| 42 | POST | `/api/v1/shopping-lists` | 建立購物清單 | — |
| 43 | GET | `/api/v1/shopping-lists/{id}` | 取得單一購物清單內容 | — |
| 44 | PATCH | `/api/v1/shopping-lists/{id}` | 編輯購物清單或標記 `{ status: 'purchased' }` | 取代舊 `/purchase` |
| 45 | DELETE | `/api/v1/shopping-lists/{id}` | 刪除購物清單 | — |
| 46 | GET | `/api/v1/shopping-lists/{id}/posts` | 取得清單貼文 | 社群功能 |
| 47 | POST | `/api/v1/shopping-lists/{id}/posts` | 建立清單貼文 | 社群功能 |
| 48 | POST | `/api/v1/posts/{postId}/like` | 貼文按讚切換 | 社群功能 |
| 49 | GET | `/api/v1/posts/{postId}/comments` | 取得貼文留言 | 社群功能 |
| 50 | POST | `/api/v1/posts/{postId}/comments` | 新增貼文留言 | 社群功能 |

### SharedListApi 介面
```typescript
export interface SharedListApi {
  getSharedLists(year?: number, month?: number): Promise<SharedListItem[]>;
  getSharedListById(id: string): Promise<SharedList>;
  createSharedList(input: CreateSharedListInput): Promise<SharedList>;
  deleteSharedList(id: string): Promise<void>;
  getPosts(listId: string): Promise<SharedListPost[]>;
  createPost(input: CreatePostInput): Promise<SharedListPost>;
  togglePostLike(postId: string, listId: string): Promise<SharedListPost>;
}
```

---

## Hooks 詳解

### `useSharedLists.ts`
```typescript
const useSharedLists = () => {
  return {
    lists: SharedListItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createList: (input: CreateSharedListInput) => Promise<void>;
    deleteList: (id: string) => Promise<void>;  // 使用 Optimistic Update
  };
};

const useSharedListDetail = (listId?: string) => {
  return {
    list: SharedList | null;
    isLoading: boolean;
    error: string | null;
  };
};
```

### `usePosts.ts`
```typescript
const usePosts = (listId?: string) => {
  return {
    posts: SharedListPost[];
    isLoading: boolean;
    error: string | null;
    createPost: (input: CreatePostInput) => Promise<void>;
    toggleLike: (postId: string) => Promise<SharedListPost | void>;
    refetch: () => Promise<void>;
  };
};
```

---

## 元件結構

| 分類 | 元件 | 說明 |
|------|------|------|
| Features | `SharedPlanningList.tsx` | 共享清單列表，依狀態篩選 |
| Features | `SharedListDetail.tsx` | 清單詳情頁，貼文牆 |
| Features | `CreatePost.tsx` | 建立新貼文 |
| Layout | `PlanningTabsSection.tsx` | 主/副 Tab 導航 |
| UI | `SharedListCard.tsx` | 清單預覽卡片 |
| UI | `PostCard.tsx` | 貼文展示卡片 |
| UI | `CoverImagePicker.tsx` | 封面圖片選擇器 (Sheet) |
| UI | `ShoppingItemEditor.tsx` | 購物項目動態編輯器 |

---

## 路由設定

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/planning` | PlanningHome | 主頁 (雙 Tab: 共享規劃 / 食譜推薦) |
| `/planning?tab=planning` | PlanningHome | 共享規劃 Tab |
| `/planning?tab=recipes` | PlanningHome | 食譜推薦 Tab |
| `/planning/list/create` | CreateSharedList | 建立共享清單 |
| `/planning/list/:listId` | SharedListDetail | 清單詳情頁 |
| `/planning/list/:listId/post/create` | CreatePost | 建立貼文 |
| `/planning/recipes/:id` | RecipeDetailView | 食譜詳情 (from Recipe module) |
| `/planning/recipes/ai-query` | AIQueryPage | AI 查詢頁 |

---

## 環境變數設定

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | 後端 API 網址 | `http://localhost:3000` |

---

## Mock 資料

Mock 資料位於 `services/mock/mockSharedListData.ts`，使用 `localStorage` 模擬資料持久化：
- `mock_shared_lists`: 共享清單列表
- `mock_posts`: 清單貼文 (以 listId 為 key)

### 測試資料
預設包含 4 個共享清單範例 (LOPIA買都買、爆買Costco、去日本買什麼、家樂福熱食好吃) 與 2 則貼文。
