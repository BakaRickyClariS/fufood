# 共享規劃功能實作規劃

## 概述

本功能將 `/recipe` 路由更名為 `/planning`（規劃），並新增「共享規劃」標籤頁，提供家庭成員協作建立購物清單的社群功能。使用者可以建立共享清單、新增購物貼文、留言與按讚互動。

## 設計稿參考

````carousel
![圖一：共享規劃列表頁](/c:/Users/USER/.gemini/antigravity/brain/9930321a-72f0-44aa-a16a-913f852cda21/uploaded_image_0_1764953260453.png)
<!-- slide -->
![圖二：建立清單頁面](/c:/Users/USER/.gemini/antigravity/brain/9930321a-72f0-44aa-a16a-913f852cda21/uploaded_image_1_1764953260453.png)
<!-- slide -->
![圖三：選擇封面照片彈窗](/c:/Users/USER/.gemini/antigravity/brain/9930321a-72f0-44aa-a16a-913f852cda21/uploaded_image_2_1764953260453.png)
<!-- slide -->
![圖四：清單內頁（社群貼文形式）](/c:/Users/USER/.gemini/antigravity/brain/9930321a-72f0-44aa-a16a-913f852cda21/uploaded_image_3_1764953260453.png)
<!-- slide -->
![圖五：新增貼文頁面](/c:/Users/USER/.gemini/antigravity/brain/9930321a-72f0-44aa-a16a-913f852cda21/uploaded_image_4_1764953260453.png)
````

---

## 路由結構（已確認）

> [!NOTE]
> **路由命名**：`/recipe` → `/planning`
>
> 符合底部導航「規劃」按鈕的語意。

### 完整路由表

| 路由 | 說明 |
|------|------|
| `/planning` | 主頁（Tab 切換：共享規劃 / 食譜推薦） |
| `/planning/list/create` | 建立共享清單 |
| `/planning/list/:listId` | 清單內頁（社群貼文列表） |
| `/planning/list/:listId/post/create` | 新增貼文 |
| `/planning/recipes` | 食譜列表 |
| `/planning/recipes/:id` | 食譜詳情頁 |
| `/planning/recipes/favorites` | 收藏食譜 |
| `/planning/recipes/ai-query` | AI 食譜查詢 |

> [!TIP]
> **共用元件策略**
>
> 直接使用現有的 `animated-tabs` 共用元件（`@/shared/components/ui/animated-tabs`），在 planning 模組內建立 `PlanningTabsSection.tsx` 版面配置元件。

---

## 功能分析

### 圖一：共享規劃列表頁

| 區塊 | 說明 |
|------|------|
| 頂部 Tab | 「共享規劃」/「食譜推薦」切換 |
| 月份選擇 | 下拉選單篩選月份 |
| 狀態篩選 | Pill 樣式 Tab（進行中/待採買/已完成） |
| 清單卡片 | 圖片背景 + 標題 + 日期標籤 |
| 右下浮動按鈕 | 點擊跳轉至「建立清單」頁面 |

### 圖二：建立清單頁面

| 區塊 | 說明 |
|------|------|
| 清單建立時間 | 自動帶入目前時間，可編輯 |
| 清單資訊 | 清單名 + 預計採買日期 + 開啟通知開關 |
| 清單封面照 | 點擊「選擇照片」開啟圖庫彈窗 |
| 儲存按鈕 | 底部固定 |

### 圖三：選擇封面照片彈窗

| 區塊 | 說明 |
|------|------|
| 半屏覆蓋彈窗 | 從底部滑入 |
| 圖片網格 | 3 欄顯示預設封面圖片 |
| 選中狀態 | 紅框 + 勾選 icon |
| 套用按鈕 | 底部確認選擇 |

### 圖四：清單內頁（社群貼文形式）

| 區塊 | 說明 |
|------|------|
| 頁頭 | 清單封面圖 + 狀態標籤 + 標題 + 日期 |
| 貼文列表 | 個人頭像 + 名稱 + 時間 + 購物明細 + 圖片 |
| 互動區 | 留言數 + 按讚數 |
| 右下浮動按鈕 | 點擊跳轉至「新增貼文」頁面 |

### 圖五：新增貼文頁面

| 區塊 | 說明 |
|------|------|
| 新增商品照片 | 點擊選擇照片 |
| 說明文字 | 最多 40 字 |
| 購物明細 | 動態新增項目（商品數量 + 商品名） |
| 分享發布按鈕 | 底部確認發布 |

---

## 型別定義

### 共享清單相關

```typescript
// types/sharedList.ts

/** 清單狀態 */
export type SharedListStatus = 'in-progress' | 'pending-purchase' | 'completed';

/** 共享清單 */
export type SharedList = {
  id: string;
  name: string;
  coverImageUrl: string;
  scheduledDate: string;        // 預計採買日期
  status: SharedListStatus;
  notifyEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  groupId: string;              // 所屬群組
};

/** 共享清單列表項目 */
export type SharedListItem = Pick<SharedList, 'id' | 'name' | 'coverImageUrl' | 'scheduledDate' | 'status'>;

/** 建立清單輸入 */
export type CreateSharedListInput = {
  name: string;
  coverImageUrl: string;
  scheduledDate: string;
  notifyEnabled: boolean;
};
```

### 貼文相關

```typescript
// types/post.ts

/** 購物明細項目 */
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
};

/** 清單貼文 */
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

/** 建立貼文輸入 */
export type CreatePostInput = {
  listId: string;
  content: string;
  images: string[];
  items: ShoppingItem[];
};

/** 留言 */
export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
};
```

---

## API 設計

### 對應至 `API_REFERENCE_V2.md` 的購物清單 API

| API 端點 | 功能對應 |
|----------|----------|
| `GET /api/v1/shopping-lists` | 取得共享清單列表 |
| `POST /api/v1/shopping-lists` | 建立共享清單 |
| `GET /api/v1/shopping-lists/{id}` | 取得清單詳情 |
| `PUT /api/v1/shopping-lists/{id}` | 更新清單 |
| `DELETE /api/v1/shopping-lists/{id}` | 刪除清單 |
| `POST /api/v1/shopping-lists/{id}/purchase` | 標記已購買 |

### 擴充 API（貼文與互動）

> [!NOTE]
> 以下為建議擴充的 API，需與後端確認。若暫無後端支援，可先使用 Mock 實作。

```typescript
// 貼文 CRUD
GET    /api/v1/shopping-lists/{id}/posts             // 取得貼文列表
POST   /api/v1/shopping-lists/{id}/posts             // 新增貼文
DELETE /api/v1/shopping-lists/{id}/posts/{postId}    // 刪除貼文

// 互動
POST   /api/v1/shopping-lists/{id}/posts/{postId}/like      // 按讚/取消
GET    /api/v1/shopping-lists/{id}/posts/{postId}/comments  // 取得留言
POST   /api/v1/shopping-lists/{id}/posts/{postId}/comments  // 新增留言
```

---

## 目錄結構

### 路由資料夾重新命名

```diff
 src/routes/
- ├── Recipe/                  # [RENAME] → Planning
+ ├── Planning/
     ├── index.tsx
     ├── PlanningLayout.tsx    # [RENAME] RecipeLayout → PlanningLayout
     ├── PlanningHome.tsx      # [RENAME] RecipeHome → PlanningHome
     ├── AIQueryPage.tsx
     ├── CreateSharedList.tsx  # [NEW]
     ├── SharedListDetail.tsx  # [NEW]
     └── CreatePost.tsx        # [NEW]
```

### 模組資料夾（保留 recipe 模組，新增 planning 模組）

```
src/modules/planning/                   # [NEW] 全新模組
├── components/
│   ├── features/
│   │   ├── SharedPlanningList.tsx      # [NEW] 共享規劃列表頁
│   │   └── RecipeListSection.tsx       # [NEW] 食譜推薦區塊（複用 recipe 元件）
│   ├── layout/
│   │   └── PlanningTabsSection.tsx     # [NEW] 規劃功能 Tab 版面
│   └── ui/
│       ├── SharedListCard.tsx          # [NEW] 清單卡片
│       ├── PostCard.tsx                # [NEW] 貼文卡片
│       ├── CoverImagePicker.tsx        # [NEW] 封面圖片選擇彈窗
│       ├── ShoppingItemEditor.tsx      # [NEW] 購物明細編輯器
│       └── FloatingActionButton.tsx    # [NEW] 浮動按鈕
├── hooks/
│   ├── useSharedLists.ts               # [NEW] 共享清單 Hook
│   ├── usePosts.ts                     # [NEW] 貼文 Hook
│   └── useInteractions.ts              # [NEW] 按讚/留言 Hook
├── services/
│   ├── api/
│   │   └── sharedListApi.ts            # [NEW] 真實 API
│   └── mock/
│       ├── mockSharedListApi.ts        # [NEW] Mock API
│       └── mockSharedListData.ts       # [NEW] Mock 資料
├── types/
│   ├── sharedList.ts                   # [NEW] 共享清單型別
│   └── post.ts                         # [NEW] 貼文型別
└── constants/
    └── coverImages.ts                  # [NEW] 預設封面圖片清單
```

### Routes 資料夾

#### [RENAME] `src/routes/Recipe/` → `src/routes/Planning/`

#### [NEW] [index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/index.tsx)
新建 Planning 路由配置。

#### [RENAME] [PlanningLayout.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/PlanningLayout.tsx)
原 RecipeLayout 重新命名。

#### [RENAME] [PlanningHome.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/PlanningHome.tsx)
原 RecipeHome 重新命名，並整合主 Tab 切換功能。

#### [NEW] [CreateSharedList.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/CreateSharedList.tsx)
建立共享清單頁面。

#### [NEW] [SharedListDetail.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/SharedListDetail.tsx)
清單內頁。

#### [NEW] [CreatePost.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Planning/CreatePost.tsx)
新增貼文頁面。

---

### Planning Module（新模組）

#### [NEW] [sharedList.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/types/sharedList.ts)
定義共享清單相關型別。

#### [NEW] [post.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/types/post.ts)
定義貼文與互動相關型別。

#### [NEW] [sharedListApi.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/services/api/sharedListApi.ts)
實作共享清單 API 呼叫。

#### [NEW] [mockSharedListApi.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/services/mock/mockSharedListApi.ts)
Mock 資料 API 實作。

#### [NEW] [useSharedLists.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/hooks/useSharedLists.ts)
共享清單資料存取 Hook。

#### [NEW] [PlanningTabsSection.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/components/layout/PlanningTabsSection.tsx)
主 Tab（共享規劃/食譜推薦）與子 Tab（進行中/待採買/已完成）版面配置。

#### [NEW] [SharedPlanningList.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/components/features/SharedPlanningList.tsx)
共享規劃列表頁面元件。

#### [NEW] [SharedListCard.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/components/ui/SharedListCard.tsx)
清單卡片 UI 元件。

#### [NEW] [CoverImagePicker.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/planning/components/ui/CoverImagePicker.tsx)
選擇封面圖片的彈窗元件。

---

### 主路由

#### [MODIFY] [index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx)
將 Recipe 路由替換為 Planning 路由。

---

### Shared Components

#### [NEW] [FloatingActionButton.tsx](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/ui/FloatingActionButton.tsx)
可重用的浮動按鈕元件（右下角加號按鈕）。

---

## Verification Plan

### 自動化測試

目前專案無單元測試設置，建議以下手動驗證流程。

### 手動驗證

1. **Tab 切換驗證**
   - 進入 `/planning` 頁面
   - 點擊「共享規劃」Tab，應顯示清單列表
   - 點擊「食譜推薦」Tab，應顯示原有食譜列表
   - 在共享規劃內，點擊「進行中」/「待採買」/「已完成」切換狀態篩選

2. **建立清單流程**
   - 點擊右下浮動按鈕，應跳轉至 `/planning/list/create`
   - 填寫清單名、選擇日期
   - 點擊「選擇照片」，彈窗應從底部滑入
   - 選擇一張圖片，應顯示紅框選中狀態
   - 點擊「套用」，彈窗關閉，封面圖顯示於表單上
   - 點擊「儲存」，應返回列表頁並顯示新建立的清單

3. **清單內頁驗證**
   - 點擊任一清單卡片，應跳轉至 `/planning/list/:listId`
   - 應顯示清單頭部資訊與貼文列表
   - 貼文應包含頭像、名稱、時間、購物明細、圖片、留言/按讚數

4. **新增貼文流程**
   - 在清單內頁點擊右下浮動按鈕
   - 應跳轉至 `/planning/list/:listId/post/create`
   - 點擊「選擇照片」可選取圖片
   - 輸入說明文字（應限制 40 字）
   - 新增購物明細項目（可增減項目）
   - 點擊「分享發布」，應返回清單內頁並顯示新貼文

5. **互動功能驗證**
   - 點擊按讚圖示，數字應+1
   - 再次點擊應取消按讚，數字-1

---

## 備註

- 此功能須確認群組 API 是否已支援權限控管（誰可以新增/編輯清單）
- 封面圖片可考慮使用 Cloudinary 或本地預設圖庫
- 留言功能可作為第二階段開發
