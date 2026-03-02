# RecipeList 主題探索篩選器重新設計

## 目標

根據設計稿，將 RecipeList 的主題探索（Category Section）改成使用圓形圖片的橫向滑動篩選器，並移除原本的搜尋欄。

## 設計稿分析

![設計稿](C:/Users/User/.gemini/antigravity/brain/903e9047-f453-49dc-aa25-bddd4e444f07/uploaded_image_1764818668098.png)

設計稿顯示：
- **主題探索**標題，右邊有箭頭按鈕（表示可以滑動）
- 一排圓形圖片，每個圖片下方有文字標籤（料理類型）
- 可以橫向滑動（不顯示滾動條）
- 類似的區塊還有「慢火煮」、「輕鬆煮」、「快速煮」、「收藏食譜」等

## 現況分析

### 當前實作

1. **RecipeList.tsx**
   - 使用 `SearchBar` 元件進行搜尋
   - 使用 `CategorySection` 元件進行分類篩選
   - 分類篩選使用文字按鈕（目前的類別：主題推薦、過火菜、韓味系、快速菜、輕食系、慢火煮、其他）

2. **CategorySection.tsx**
   - 顯示文字按鈕的橫向滑動列表
   - 使用 `overflow-x-auto` 和 `scrollbar-hide` 樣式
   - 選中狀態使用橘色背景

3. **可用的 Category 圖片**
   - `src/assets/images/recipe/category/` 資料夾內有以下圖片：
     - American.png（美式料理）
     - Chinese.png（中式料理）
     - Drinks.png（飲品）
     - Healthy.png（健康輕食）
     - Italian.png（義式料理）
     - Japanese.png（日式料理）
     - Korean.png（韓式料理）
     - Mexican.png（墨西哥料理）
     - Sichuan.png（川菜）
     - Sweets.png（甜點）
     - Thai.png（泰式料理）
     - Vietnamese.png（越南料理）

### 差異點

1. **現有分類 vs 可用圖片的對應問題**
   - 現有分類：主題推薦、過火菜、韓味系、快速菜、輕食系、慢火煮、其他
   - 可用圖片：各國料理分類
   - **需要決定：是否要更新分類系統以配合圖片？**

2. **UI 呈現方式**
   - 目前：文字按鈕
   - 設計稿：圓形圖片 + 底部文字標籤

3. **搜尋功能**
   - 目前：有搜尋欄
   - 設計稿：無搜尋欄

## 修改計劃

### 方案一：更新分類系統（建議）

#### 1. 更新分類定義

**檔案：`src/modules/recipe/types/recipe.ts`**

```typescript
export type RecipeCategory = 
  | '中式料理'
  | '美式料理'
  | '義式料理'
  | '日式料理'
  | '泰式料理'
  | '韓式料理'
  | '墨西哥料理'
  | '川菜'
  | '越南料理'
  | '健康輕食'
  | '甜點'
  | '飲品';
```

**檔案：`src/modules/recipe/constants/categories.ts`**

```typescript
import type { RecipeCategory } from '@/modules/recipe/types';

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  '中式料理',
  '美式料理',
  '義式料理',
  '日式料理',
  '泰式料理',
  '韓式料理',
  '墨西哥料理',
  '川菜',
  '越南料理',
  '健康輕食',
  '甜點',
  '飲品'
];

// 分類圖片對應表
export const CATEGORY_IMAGES: Record<RecipeCategory, string> = {
  '中式料理': '/src/assets/images/recipe/category/Chinese.png',
  '美式料理': '/src/assets/images/recipe/category/American.png',
  '義式料理': '/src/assets/images/recipe/category/Italian.png',
  '日式料理': '/src/assets/images/recipe/category/Japanese.png',
  '泰式料理': '/src/assets/images/recipe/category/Thai.png',
  '韓式料理': '/src/assets/images/recipe/category/Korean.png',
  '墨西哥料理': '/src/assets/images/recipe/category/Mexican.png',
  '川菜': '/src/assets/images/recipe/category/Sichuan.png',
  '越南料理': '/src/assets/images/recipe/category/Vietnamese.png',
  '健康輕食': '/src/assets/images/recipe/category/Healthy.png',
  '甜點': '/src/assets/images/recipe/category/Sweets.png',
  '飲品': '/src/assets/images/recipe/category/Drinks.png'
};
```

#### 2. 重新設計 CategorySection 元件

**檔案：`src/modules/recipe/components/layout/CategorySection.tsx`**

新增功能：
- 使用圓形圖片代替文字按鈕
- 每個圖片下方顯示分類名稱
- 添加「全部」選項（使用預設圖示或設計）
- 右側添加箭頭按鈕（視覺提示可滑動）
- 保持橫向滑動，隱藏滾動條
- 選中狀態：圓形邊框高亮或添加選中標記

#### 3. 修改 RecipeList 元件

**檔案：`src/modules/recipe/components/features/RecipeList.tsx`**

修改內容：
- 移除 `SearchBar` 元件和相關邏輯
- 移除 `searchQuery` state
- 移除 `filteredRecipes` 的搜尋邏輯（只保留分類篩選）
- 保持 `CategorySection` 的使用

#### 4. 更新 Mock 資料

**檔案：`src/modules/recipe/services/mock/mockRecipeData.ts`**（如果存在）

需要更新所有 mock 食譜的 category 屬性，使用新的分類名稱。

### 方案二：保持現有分類，創建圖片映射（替代方案）

如果不想修改現有的分類系統，可以：
1. 創建一個映射表，將現有分類對應到最接近的圖片
2. 例如：「韓味系」→ Korean.png，「輕食系」→ Healthy.png
3. 對於沒有對應圖片的分類，使用預設圖示

## 實作細節

### CategorySection 的 UI 結構

```tsx
<div className="space-y-3">
  {/* 標題列 */}
  <div className="flex items-center justify-between px-4">
    <h2 className="text-lg font-bold">主題探索</h2>
    <button className="text-gray-500">
      <ArrowRight />
    </button>
  </div>
  
  {/* 分類滑動列表 */}
  <div className="overflow-x-auto scrollbar-hide px-4">
    <div className="flex gap-4">
      {/* 全部選項 */}
      <button className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2">
          {/* 全部的圖示或圖片 */}
        </div>
        <span className="text-xs">全部</span>
      </button>
      
      {/* 各分類選項 */}
      {RECIPE_CATEGORIES.map(category => (
        <button className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2">
            <img src={CATEGORY_IMAGES[category]} alt={category} />
          </div>
          <span className="text-xs">{category}</span>
        </button>
      ))}
    </div>
  </div>
</div>
```

### 滑動實作

**簡單方式（建議）：**
使用原生 CSS `overflow-x-auto` + `scrollbar-hide`
- 優點：簡單、輕量
- 缺點：需要手動實作滑動按鈕功能（可選）

**使用 Swiper（如果需要更多功能）：**
- 可以添加導航按鈕
- 可以設定滑動效果
- 支援觸控和滑鼠滑動

範例：
```tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

<Swiper
  spaceBetween={16}
  slidesPerView="auto"
  modules={[Navigation]}
  navigation
  className="category-swiper"
>
  {RECIPE_CATEGORIES.map(category => (
    <SwiperSlide style={{ width: 'auto' }}>
      {/* 分類按鈕 */}
    </SwiperSlide>
  ))}
</Swiper>
```

## 驗證計劃

### 手動測試步驟

1. **視覺檢查**
   - [ ] 啟動開發伺服器：`npm run dev`
   - [ ] 導航到食譜頁面
   - [ ] 確認「主題探索」區塊顯示正確
   - [ ] 確認有圓形圖片和底部文字
   - [ ] 確認右側有箭頭按鈕
   - [ ] 確認沒有顯示搜尋欄

2. **功能測試**
   - [ ] 測試橫向滑動是否流暢
   - [ ] 確認不顯示橫向滾動條
   - [ ] 點擊不同分類，確認篩選功能正常
   - [ ] 點擊「全部」，確認顯示所有食譜
   - [ ] 確認選中狀態的視覺回饋清晰

3. **響應式測試**
   - [ ] 在不同螢幕尺寸下測試（手機、平板、桌面）
   - [ ] 確認圖片大小適中
   - [ ] 確認文字可讀性

## 注意事項

1. **分類系統變更的影響**
   - 如果採用方案一，需要更新所有相關的 mock 資料
   - 可能需要更新後端 API（如果有）
   - 需要更新測試資料

2. **圖片路徑**
   - 確認圖片路徑在 Vite 專案中正確引入
   - 可能需要使用 `import` 或 public 資料夾

3. **效能考量**
   - 12 張圖片不大，但建議優化圖片大小
   - 可以考慮使用 lazy loading（如果有更多圖片）

4. **無障礙性**
   - 確保圖片有適當的 alt 文字
   - 確保按鈕有明確的 aria-label
   - 確保鍵盤導航功能正常

## 建議實作順序

1. 先決定採用方案一還是方案二
2. 更新分類定義和常數（如果採用方案一）
3. 修改 CategorySection 元件
4. 修改 RecipeList 元件（移除搜尋欄）
5. 更新 mock 資料（如果需要）
6. 進行視覺和功能測試
7. 優化細節和樣式

## 待確認問題

1. **是否要完全更換分類系統？**（方案一 vs 方案二）
2. **是否要使用 Swiper 還是原生 CSS 滑動？**
3. **「全部」選項要使用什麼圖示/圖片？**
4. **選中狀態的視覺設計細節？**（邊框顏色、陰影等）
5. **箭頭按鈕是否需要實際功能（點擊滑動）還是僅作為視覺提示？**
