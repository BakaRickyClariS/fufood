# API 問題修復規劃 (2025/12/30) - 完整版

> 根據 `api-problem-1230.md` 問題清單、用戶提供的正確狀態截圖與反饋進行分析

---

## 問題總覽

| # | 模組 | 問題描述 | 負責端 | 優先級 |
|---|------|----------|--------|--------|
| 1 | Inventory | 食品詳細卡片分類名稱應顯示中文 | 前端 (復用 settings) | 高 |
| 2 | Inventory | 日期顯示格式錯誤（應為 YYYY/MM/DD） | 前端 | 中 |
| 3 | Groups | 群組切換時庫存狀態不自動刷新 | 前端 (Redux/Query) | 高 |
| 4 | Planning | 當天創建計畫變已完成 | 前端 (狀態計算邏輯) | 高 |
| 5 | Planning | Shopping List API 問題（Item API） | 前端 | 高 |
| 6 | Planning | 編輯頁面 404 | 前端 (路由) | 高 |
| 7 | Planning | 刪除功能 JSON 格式錯誤 | 前端 | 中 |
| 8 | Recipe | AI 食譜圖片相同、內容未按庫存生成、空 src 錯誤 | 前端 + AI 後端 | 高 |
| 9 | Dashboard | 庫存數量未同步 | 前端 (API 參數) | 中 |

---

## 一、Inventory 模組問題

### 1.1 食品詳細卡片分類名稱應顯示中文

**問題分析**：
- AI 後端的 `getSettings` API 回傳 `settings.categories` 包含中文 `title`
- 但 `FoodDetailModal` 直接使用 `item.category`（可能是英文 key）
- 應該從 settings 取得分類的中文名稱來顯示

**修復方案**：

##### [MODIFY] [FoodDetailModal.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/components/ui/modal/FoodDetailModal.tsx)

使用 `useInventorySettingsQuery` 取得分類設定，並建立映射：

```typescript
import { useInventorySettingsQuery } from '@/modules/inventory/api/queries';
import { useMemo } from 'react';

// 在元件內
const { data: settingsData } = useInventorySettingsQuery(item.groupId);

// 建立 category ID → 中文名稱的映射
const categoryNameMap = useMemo(() => {
  const categories = settingsData?.data?.settings?.categories || [];
  return categories.reduce((acc, cat) => {
    acc[cat.id] = cat.title;
    return acc;
  }, {} as Record<string, string>);
}, [settingsData]);

// 使用時（約第 267 行）
{categoryNameMap[item.category] || item.category || '未分類'}
```

> [!NOTE]
> AI 後端已提供中文分類名稱，前端只需復用現有的 settings API 資料。

---

### 1.2 日期顯示格式問題

**問題分析**：
- 正確格式應為 `2025/01/01`
- 目前可能顯示 ISO 格式或帶時間

**修復方案**：

##### [MODIFY] [FoodDetailModal.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/components/ui/modal/FoodDetailModal.tsx)

新增日期格式化工具函數：

```typescript
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 使用時（約第 300 行、318 行）
{formatDate(item.purchaseDate)}  // 入庫日期
{formatDate(item.expiryDate)}    // 過期日期
```

---

## 二、Groups 模組問題

### 2.1 群組切換時庫存狀態與設定不自動刷新

**問題分析**：
- `useInventorySummaryQuery` 在 `InventorySection.tsx` 中呼叫時**沒有傳入 `refrigeratorId`**
- 導致群組切換後無法正確重新取得對應群組的庫存資料
- TanStack Query 的 `queryKey` 沒有包含 `refrigeratorId`，無法區分不同群組的快取

**修復方案**：

##### [MODIFY] [InventorySection.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/dashboard/components/InventorySection.tsx)

傳入 `refrigeratorId` 給 `useInventorySummaryQuery`：

```typescript
// 取得當前 refrigeratorId
const refrigeratorId = localStorage.getItem('activeRefrigeratorId') || '';

const { data, isLoading } = useInventorySummaryQuery(refrigeratorId);
```

##### 其他需確認的頁面

檢查以下頁面是否也有類似問題：
- `OverviewPanel.tsx`
- `SettingsPanel.tsx`

---

## 三、Planning 模組問題 (Shopping List)

### 3.1 當天創建計畫變已完成

**問題分析**：
- 在 `useSharedLists.ts` 中，`computeStatus` 邏輯如下：
  ```typescript
  const computeStatus = (startsAt: string): SharedListStatus => {
    const start = new Date(startsAt).getTime();
    const now = new Date().getTime();
    return start < now ? 'completed' : 'in-progress';
  };
  ```
- **問題**：當 `startsAt` 是當天（今天），如果當前時間已過該時間點，會立即變成 `completed`
- **正確邏輯**：應該是預計採買日期的**隔天**才標記為已完成

**修復方案**：

##### [MODIFY] [useSharedLists.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/planning/hooks/useSharedLists.ts)

修正 `computeStatus` 邏輯（約第 20-26 行）：

```typescript
const computeStatus = (startsAt: string): SharedListStatus => {
  const startDate = new Date(startsAt);
  // 設定為當天 23:59:59
  startDate.setHours(23, 59, 59, 999);
  
  const now = new Date();
  
  // 只有當現在時間超過 startsAt 當天結束時（即隔天）才標記為已完成
  return now.getTime() > startDate.getTime() ? 'completed' : 'in-progress';
};
```

---

### 3.2 Shopping List API 修正

**問題分析**：
- Post API 與 Item API 功能重複（建立貼文 = 建立 Item）
- 應移除 Post API，統一使用 Item API

**正確的 API 端點**（根據用戶提供的截圖）：

| 操作 | 端點 |
|------|------|
| 取得清單列表 | `GET /api/v1/refrigerators/{refrigeratorId}/shopping_lists` |
| 建立清單 | `POST /api/v1/refrigerators/{refrigeratorId}/shopping_lists` |
| 取得單一清單 | `GET /api/v1/shopping_lists/{shoppingListId}` |
| 更新清單 | `PUT /api/v1/shopping_lists/{shoppingListId}` |
| 刪除清單 | `DELETE /api/v1/shopping_lists/{shoppingListId}` |
| 取得清單項目 | `GET /api/v1/shopping_lists/{shoppingListId}/items` |
| 建立清單項目 | `POST /api/v1/shopping_lists/{shoppingListId}/items` |
| 更新項目 | `PUT /api/v1/shopping_list_items/{itemId}` |
| 刪除項目 | `DELETE /api/v1/shopping_list_items/{itemId}` |

**修復方案**：

##### [MODIFY] [sharedListApi.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/planning/services/api/sharedListApi.ts)

1. **移除尾斜線**：
```diff
  async updateSharedListItem(
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ): Promise<void> {
    return backendApi.put<void>(
-     `/api/v1/shopping_list_items/${itemId}/`,
+     `/api/v1/shopping_list_items/${itemId}`,
      input,
    );
  }

  async deleteSharedListItem(itemId: string): Promise<void> {
-   return backendApi.delete<void>(`/api/v1/shopping_list_items/${itemId}/`);
+   return backendApi.delete<void>(`/api/v1/shopping_list_items/${itemId}`);
  }
```

2. **移除 Post Operations**（第 126-155 行），因為 Post = Item，改用 Item API

##### [MODIFY] [SharedListApi type](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/planning/services/api/sharedListApi.ts)

移除 type 定義中的 Post 方法（第 39-47 行）：
```diff
- // Posts (Legacy/Existing)
- getPosts(listId: string): Promise<SharedListPost[]>;
- createPost(input: CreatePostInput): Promise<SharedListPost>;
- deletePost(postId: string, listId: string): Promise<void>;
- updatePost(
-   postId: string,
-   listId: string,
-   input: CreatePostInput,
- ): Promise<SharedListPost>;
```

##### 呼叫端更新

搜尋並更新所有呼叫 `getPosts`、`createPost`、`deletePost`、`updatePost` 的地方，改用對應的 Item API：
- `getPosts` → `getSharedListItems`
- `createPost` → `createSharedListItem`
- `deletePost` → `deleteSharedListItem`
- `updatePost` → `updateSharedListItem`

---

### 3.3 編輯頁面 404 問題

**檢查結果**：
- 在 `src/routes/Planning/` 目錄下**沒有** `EditSharedList.tsx` 元件
- 路由 `list/:listId/edit` 未在 `PlanningRoutes` 中定義

**修復方案**：

##### [NEW] [EditSharedList.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Planning/EditSharedList.tsx)

建立編輯頁面元件，可複用 `CreateSharedList.tsx` 的邏輯：

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sharedListApi } from '@/modules/planning/services/api/sharedListApi';
import type { SharedList, CreateSharedListInput } from '@/modules/planning/types';

const EditSharedList: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<SharedList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      sharedListApi.getSharedListById(listId)
        .then(setList)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [listId]);

  const handleSubmit = async (input: CreateSharedListInput) => {
    if (!listId) return;
    await sharedListApi.updateSharedList(listId, input);
    navigate(`/planning/list/${listId}`);
  };

  // ... 表單 UI（可復用 CreateSharedList 的 UI）
};

export default EditSharedList;
```

##### [MODIFY] [index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Planning/index.tsx)

新增路由：

```diff
+ import EditSharedList from './EditSharedList';

const PlanningRoutes = [
  {
    path: 'planning',
    element: <PlanningLayout />,
    children: [
      // ... 現有路由
+     {
+       path: 'list/:listId/edit',
+       element: <EditSharedList />,
+       handle: { headerVariant: 'none', footer: false },
+     },
    ],
  },
];
```

---

### 3.4 刪除功能 JSON 格式錯誤

**問題分析**：
- 錯誤訊息：`SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`
- 這表示刪除 API 回傳空 body，但前端 `backendApi` 嘗試解析 JSON

**修復方案**：

##### [MODIFY] API Client（如 `backendApi`）

確認 `delete` 方法在處理回應時檢查 `Content-Length` 或使用 try-catch：

```typescript
// 在 API client 的 delete 方法中
const response = await fetch(url, options);

if (response.status === 204 || response.headers.get('content-length') === '0') {
  return; // 空回應，不嘗試解析 JSON
}

return response.json();
```

或在 `sharedListApi.ts` 中確保不回傳值：

```typescript
async deleteSharedList(id: string): Promise<void> {
  await backendApi.delete(`/api/v1/shopping_lists/${id}`);
  // 不 return 任何值
}
```

---

## 四、Recipe 模組問題

### 4.1 AI 食譜問題

**用戶回報的問題**：
1. AI 聊天介面中生成的食譜圖片都一樣
2. 點開食譜後，內容不是按照庫存食材生成的
3. 控制台錯誤：`An empty string ("") was passed to the src attribute`
4. **AI 回傳原始 JSON 字串直接顯示在介面上**（如下圖）

![AI 回傳原始 JSON 問題](file:///C:/Users/User/.gemini/antigravity/brain/0720be44-7357-4d49-87b2-845c226069bb/uploaded_image_1767074209291.png)

**問題分析**：

經檢查程式碼發現：

1. **原始 JSON 顯示問題**（新增）：
   - 截圖顯示 AI 回傳的 `greeting` 內容包含整個 JSON 字串
   - 這表示 **AI 後端回傳格式錯誤**：`greeting` 欄位應只包含問候語文字，而非整個 JSON
   - 或者 SSE 串流解析有問題，將整個回應當作 `text` 顯示

2. **圖片都一樣的問題**：
   - `useRecipeStream.ts` 第 132 行：`imageUrl: r.imageUrl || ''`
   - 如果 AI 後端沒有正確生成每道食譜的獨立圖片，或回傳的 `imageUrl` 為 `null`/`undefined`，會變成空字串
   - `RecipeCard.tsx` 有 fallback 圖片（第 28-30 行），但 fallback 使用相同的 Unsplash 圖片

3. **空 src 錯誤**：
   - 當 `imageUrl` 為空字串時，`<img src="">` 會觸發瀏覽器警告
   - 需在渲染前檢查並使用 fallback 或不渲染

4. **內容未按庫存食材生成**：
   - 可能是 AI 後端沒有正確使用 `selectedIngredients` 參數
   - 或前端傳送的 `selectedIngredients` 格式不正確
   - **庫存食材沒有自動夾帶到 AI 請求中**

**修復方案**：

##### [MODIFY] [useRecipeStream.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/ai/hooks/useRecipeStream.ts)

修正 imageUrl 處理（約第 128-140 行）：

```diff
  finalRecipes = savedRecipes.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category || '其他',
-   imageUrl: r.imageUrl || '',
+   imageUrl: r.imageUrl || null,  // 使用 null 而非空字串
    servings: r.servings,
    cookTime: r.cookTime || 0,
    isFavorite: r.isFavorite ?? false,
    difficulty: r.difficulty || '簡單',
    ingredients: r.ingredients,
    seasonings: r.seasonings,
    steps: r.steps,
  }));
```

##### [MODIFY] [RecipeCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/recipe/RecipeCard.tsx)

修正 fallback 邏輯（約第 28-30 行）：

```diff
  // Fallback for empty imageUrl
  const imageUrl =
-   recipe.imageUrl ||
+   (recipe.imageUrl && recipe.imageUrl.trim() !== '') 
+     ? recipe.imageUrl 
+     : 
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';
```

##### [MODIFY] [AIQueryModal.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/ai/components/AIQueryModal.tsx)

確認傳送給 AI 的 `selectedIngredients` 參數（約第 124-127 行），檢查傳送格式是否正確：

```typescript
// 確認 selectedIngredients 有正確傳遞
await generate({
  prompt: textToSubmit || '請根據我選擇的食材推薦食譜',
  selectedIngredients,  // 確認這是 string[] 格式
});
```

> [!WARNING]
> **AI 後端待確認**：
> 1. AI 後端是否正確接收並使用 `selectedIngredients` 參數？
> 2. AI 是否為每道食譜生成獨立的圖片？還是使用相同的佔位圖？
> 3. 圖片生成 API 是否正常運作？

---

## 五、Dashboard 模組問題

### 5.1 庫存數量未同步

**問題分析**：
根據用戶提供的 API 截圖，正確的庫存摘要 API 為：
- `GET /api/v1/refrigerators/{refrigeratorId}/inventory/summary`

**當前程式碼問題**：
- `InventorySection.tsx` 第 36 行：`const { data, isLoading } = useInventorySummaryQuery();`
- **沒有傳入 `refrigeratorId`**！

**修復方案**：

##### [MODIFY] [InventorySection.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/dashboard/components/InventorySection.tsx)

```diff
+ // 取得當前選擇的冰箱 ID
+ const refrigeratorId = localStorage.getItem('activeRefrigeratorId') || '';

- const { data, isLoading } = useInventorySummaryQuery();
+ const { data, isLoading } = useInventorySummaryQuery(refrigeratorId);
```

> [!NOTE]
> 此修改也會同時解決問題 2.1（群組切換時庫存不刷新），因為 `queryKey` 會包含 `refrigeratorId`，切換群組後會重新 fetch。

---

## 修改檔案清單

| 檔案 | 操作 | 說明 |
|------|------|------|
| `FoodDetailModal.tsx` | MODIFY | 使用 settings 分類名稱、日期格式化 |
| `InventorySection.tsx` | MODIFY | 傳入 `refrigeratorId` 給 query |
| `useSharedLists.ts` | MODIFY | 修正 `computeStatus` 邏輯 |
| `sharedListApi.ts` | MODIFY | 移除 Post API、移除尾斜線 |
| `EditSharedList.tsx` | NEW | 新增編輯頁面元件 |
| `Planning/index.tsx` | MODIFY | 新增編輯路由 |
| API Client | MODIFY | 處理 204 空回應（刪除功能） |
| `useRecipeStream.ts` | MODIFY | imageUrl 使用 null 而非空字串 |
| `RecipeCard.tsx` | MODIFY | 修正 fallback 圖片判斷邏輯 |
| `AIQueryModal.tsx` | MODIFY | 確認 selectedIngredients 傳遞 |

---

## 驗證計畫

### 手動驗證步驟

#### 問題 1：Inventory 分類中文名稱
1. 開啟庫存頁面，點擊任一食品項目
2. 確認「產品分類」顯示中文（如「蔬果類」而非 `fruit`）

#### 問題 2：日期格式
1. 在食品詳細卡片中查看「入庫日期」和「過期日期」
2. 確認格式為 `2025/01/01`（非 ISO 格式）

#### 問題 4：計畫狀態邏輯
1. 用**今天**的日期建立一個購物清單
2. 確認該清單狀態為「進行中」而非「已完成」
3. 將系統時間調到明天，確認清單變為「已完成」

#### 問題 5：Shopping List API
1. 進入共享清單頁面
2. 建立一個清單項目（原貼文功能）
3. 編輯該項目
4. 刪除該項目
5. 確認所有操作無錯誤

#### 問題 6：編輯頁面
1. 點擊清單的「編輯」按鈕
2. 確認進入編輯頁面（非 404）
3. 修改標題後儲存，確認變更成功

#### 問題 7：刪除功能
1. 刪除一個清單或項目
2. 確認無 JSON 解析錯誤

#### 問題 8：AI 食譜
1. 開啟 AI 聊天介面
2. 選擇庫存食材後生成食譜
3. 確認：
   - 無 `empty src` 控制台錯誤
   - 每道食譜有不同圖片（若 AI 後端支援）
   - 食譜內容與選擇的食材相關

#### 問題 9：庫存數量同步
1. 確認 Dashboard 顯示的庫存數量
2. 切換到其他群組
3. 確認 Dashboard 自動更新為新群組的庫存數量

---

## AI 後端待確認事項

> [!WARNING]
> 問題 8（AI 食譜）需要 AI 後端確認：
> 1. 是否正確接收並使用 `selectedIngredients` 參數來生成食譜？
> 2. 是否為每道食譜生成獨立圖片？還是使用相同佔位圖？
> 3. 圖片生成功能是否正常運作？
> 4. **新問題**：`greeting` 欄位為何包含整個 JSON 字串？應只包含問候語文字

---

## 六、AI 食譜新功能需求（庫存食材自動使用）

### 6.1 需求描述

用戶希望 AI 食譜生成功能能夠：
1. **自動夾帶庫存食材**：如果用戶有庫存食材，自動將庫存內的食材作為生成依據
2. **無庫存時正常生成**：如果沒有庫存食材，則按照一般模式生成推薦食譜
3. **手動選擇食材**：用戶可以從庫存中選擇特定食材來生成食譜
4. **關閉庫存食材功能**：用戶可以手動關閉「使用庫存食材」功能，改用自由輸入模式

### 6.2 前端實作方案

##### [MODIFY] [AIQueryModal.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/ai/components/AIQueryModal.tsx)

**新增狀態與邏輯**：

```typescript
// 新增狀態
const [useInventory, setUseInventory] = useState(true); // 是否使用庫存食材
const [autoLoadedIngredients, setAutoLoadedIngredients] = useState<string[]>([]);

// 自動載入庫存食材
useEffect(() => {
  if (useInventory && isOpen) {
    const loadInventoryIngredients = async () => {
      try {
        const refrigeratorId = localStorage.getItem('activeRefrigeratorId');
        if (!refrigeratorId) return;
        
        const response = await inventoryApi.getInventory({ groupId: refrigeratorId });
        const ingredientNames = response.data.items.map(item => item.name);
        setAutoLoadedIngredients(ingredientNames);
        
        // 如果用戶沒有手動選擇食材，則使用自動載入的食材
        if (selectedIngredients.length === 0) {
          setSelectedIngredients(ingredientNames);
        }
      } catch (error) {
        console.warn('無法載入庫存食材', error);
      }
    };
    loadInventoryIngredients();
  }
}, [useInventory, isOpen]);

// 切換庫存模式
const handleToggleInventoryMode = () => {
  setUseInventory(!useInventory);
  if (useInventory) {
    // 關閉時清空自動載入的食材
    setSelectedIngredients([]);
  } else {
    // 開啟時重新載入
    setSelectedIngredients(autoLoadedIngredients);
  }
};
```

**UI 新增開關**：

```tsx
{/* 庫存食材開關 */}
<div className="flex items-center gap-2 px-4 py-2">
  <label className="text-sm text-gray-600">使用庫存食材</label>
  <button
    onClick={handleToggleInventoryMode}
    className={cn(
      'w-10 h-6 rounded-full transition-colors',
      useInventory ? 'bg-primary-500' : 'bg-gray-300'
    )}
  >
    <div className={cn(
      'w-4 h-4 bg-white rounded-full transition-transform',
      useInventory ? 'translate-x-5' : 'translate-x-1'
    )} />
  </button>
</div>
```

**修改生成邏輯**：

```typescript
const handleSubmit = async (textToSubmit: string = query) => {
  if (!textToSubmit.trim() && selectedIngredients.length === 0) return;
  if (isLoading) return;

  setQuery(textToSubmit);
  
  // 根據模式決定是否帶入食材
  const ingredientsToSend = useInventory ? selectedIngredients : [];
  
  await generate({
    prompt: textToSubmit || (ingredientsToSend.length > 0 
      ? '請根據我選擇的食材推薦食譜' 
      : '請推薦一些食譜'),
    selectedIngredients: ingredientsToSend,
  });
};
```

### 6.3 後端配合需求

詳見 [ai-recipe-backend-issues.md](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/fixes/ai-recipe-backend-issues.md)

---

## 修改檔案清單（更新）

| 檔案 | 操作 | 說明 |
|------|------|------|
| `FoodDetailModal.tsx` | MODIFY | 使用 settings 分類名稱、日期格式化 |
| `InventorySection.tsx` | MODIFY | 傳入 `refrigeratorId` 給 query |
| `useSharedLists.ts` | MODIFY | 修正 `computeStatus` 邏輯 |
| `sharedListApi.ts` | MODIFY | 移除 Post API、移除尾斜線 |
| `EditSharedList.tsx` | NEW | 新增編輯頁面元件 |
| `Planning/index.tsx` | MODIFY | 新增編輯路由 |
| API Client | MODIFY | 處理 204 空回應（刪除功能） |
| `useRecipeStream.ts` | MODIFY | imageUrl 使用 null 而非空字串 |
| `RecipeCard.tsx` | MODIFY | 修正 fallback 圖片判斷邏輯 |
| `AIQueryModal.tsx` | MODIFY | 新增庫存食材自動載入、開關功能 |

