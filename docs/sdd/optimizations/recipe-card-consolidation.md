# 食譜卡片元件整合規劃

## 問題分析

目前專案中存在 **5 個**與食譜卡片相關的元件，分散在 `dashboard` 和 `recipe` 兩個模組中，造成以下問題：

1. **重複程式碼**：多個元件實作相似功能但介面不一致
2. **維護困難**：修改卡片設計需要同步更新多個檔案
3. **資料介面不一致**：dashboard 使用 props drilling，recipe 使用 `RecipeListItem` 型別
4. **樣式不統一**：不同元件的視覺設計存在差異

## 現有元件清單

### Dashboard 模組

#### 1. [RecipeCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/dashboard/components/RecipeCard.tsx)
- **用途**：Dashboard 首頁的推薦食譜卡片
- **佈局**：Grid 佈局，2 列顯示
- **資料來源**：靜態 props（cover, tag, category, title, servings, time）
- **特色**：
  - 使用 emoji 圖標（👤 ⏱）
  - 半透明黑底分類標籤
  - 黑底愛心按鈕（無實際功能）
  - 圖片上方＋文字下方的傳統卡片佈局

#### 2. [RecipeSection.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/dashboard/components/RecipeSection.tsx)
- **用途**：包裝 RecipeCard 的區塊容器
- **問題**：硬編碼式資料，無法動態使用

### Recipe 模組

#### 3. [RecipeCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/components/ui/RecipeCard.tsx) ✨ **最新設計**
- **用途**：食譜列表的主卡片（Grid 佈局）
- **佈局**：正方形卡片 (`aspect-square`)
- **資料來源**：`RecipeListItem` 型別
- **特色**：
  - **圖片疊加文字佈局**（最符合設計稿）
  - 底部漸層遮罩 (`bg-gradient-to-t from-black/70`)
  - 白色輪廓愛心按鈕（右上角）
  - 熱門標籤（左上角，可選顯示 `showPopularTag` prop）
  - 白色半透明分類標籤
  - 白色大標題與資訊區
  - Lucide React 圖標（Users, Clock, Heart）
  - 整合 `useFavorite` hook（具備收藏功能）

#### 4. [RecipeSectionCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/components/ui/RecipeSectionCard.tsx)
- **用途**：水平捲動區塊的卡片（較小尺寸）
- **佈局**：固定寬度 `w-40`，水平排列
- **資料來源**：`RecipeListItem` 型別
- **特色**：
  - 圖片上方＋文字下方佈局
  - 白底愛心按鈕（右上角）
  - **固定顯示「熱門」標籤**（無條件判斷）
  - 半透明白底分類標籤
  - Hover 放大效果 (`group-hover:scale-105`)
  - 整合 `useFavorite` hook

#### 5. [RecipeSection.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/components/ui/RecipeSection.tsx)
- **用途**：水平捲動容器
- **功能**：標題列、滑動按鈕、隱藏捲軸樣式
- **使用元件**：`RecipeSectionCard`

---

## 元件差異對比表

| 特性 | Dashboard<br/>RecipeCard | Recipe<br/>RecipeCard ✨ | Recipe<br/>RecipeSectionCard |
|------|-------------------------|------------------------|----------------------------|
| **佈局方式** | Grid 2列 | Grid 任意列 | 水平捲動 |
| **卡片尺寸** | 不固定 | `aspect-square` | `w-40` 固定寬 |
| **資料介面** | 原始 props | `RecipeListItem` | `RecipeListItem` |
| **設計風格** | 傳統卡片 | **圖片疊加文字** | 傳統卡片 |
| **愛心按鈕** | 裝飾性 | 功能完整（useFavorite） | 功能完整（useFavorite） |
| **熱門標籤** | 可選 | 可選（showPopularTag） | 固定顯示 |
| **分類標籤** | 半透明黑底 | 半透明白底 | 半透明白底 |
| **圖標系統** | Emoji | Lucide React | Lucide React |
| **漸層效果** | ❌ 無 | ✅ 漸層遮罩 | ❌ 無 |

---

## 整合方案

### 目標

1. **統一卡片元件**：建立單一、可配置的食譜卡片元件
2. **移除重複程式碼**：刪除冗餘元件
3. **保持靈活性**：透過 props 支援不同使用場景
4. **統一資料介面**：全面使用 `RecipeListItem` 型別

### 建議架構

```
src/shared/components/recipe/
├── RecipeCard.tsx          # 統一的食譜卡片元件（基於 recipe/RecipeCard）
├── RecipeCardGrid.tsx      # Grid 佈局容器（新建）
└── RecipeCardCarousel.tsx  # 水平捲動容器（基於 recipe/RecipeSection）
```

---

## 實作計劃

### 階段一：建立共用元件

#### 1. 建立 `src/shared/components/recipe/RecipeCard.tsx`

**設計決策**：基於最新 Dashboard 設計稿，統一使用圖片疊加文字佈局

```tsx
type RecipeCardProps = {
  recipe: RecipeListItem;
  onClick: (id: string) => void;
  showPopularTag?: boolean;            // 是否顯示熱門標籤（左上角）
  showCategoryBadge?: boolean;         // 是否顯示分類標籤（預設 true）
  aspectRatio?: 'square' | '4/3';      // 卡片比例（預設 square）
  size?: 'default' | 'compact';        // 卡片尺寸
  className?: string;                  // 允許外部覆寫樣式
}
```

**關鍵設計特性**：

1. **圖片疊加文字佈局（統一）**
   - 所有變體都使用圖片疊加文字
   - 不再提供傳統的「圖片上+文字下」佈局

2. **半透明模糊背景（必須）**
   - 分類標籤：`bg-black/50 backdrop-blur-sm text-white`
   - 底部資訊區：`bg-black/60 backdrop-blur-md`
   - 確保文字在任何背景圖片上都清晰易讀

3. **熱門標籤（可選）**
   - 透過 `showPopularTag` prop 控制顯示/隱藏
   - 樣式：`bg-[#E85A4F] text-white rounded-lg`
   - 位置：左上角

4. **愛心按鈕（功能完整）**
   - 整合 `useFavorite` hook
   - 無背景，直接疊在圖片上
   - 白色輪廓（未收藏）/ 實心白色（已收藏）

5. **時間文字強調**
   - 時間數字使用橙紅色 `text-primary-500` 或 `text-[#FF6B4A]`
   - 與人數文字（白色）形成視覺對比

**尺寸變體說明**：

- `size="default"` (預設)
  - 正方形 (`aspect-square`)
  - 大標題 (`text-xl font-bold`)
  - 適用：Grid 佈局、詳細展示
  
- `size="compact"`
  - 固定寬度 `w-40` 或 `w-48`
  - 小標題 (`text-base font-bold`)
  - 適用：水平捲動、Dashboard 推薦區

**程式碼範例**：

```tsx
export const RecipeCard = ({ 
  recipe, 
  onClick, 
  showPopularTag = false,
  showCategoryBadge = true,
  aspectRatio = 'square',
  size = 'default',
  className = ''
}: RecipeCardProps) => {
  const { toggleFavorite, isToggling } = useFavorite();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow",
        aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/3]',
        size === 'compact' && 'w-40',
        className
      )}
      onClick={() => onClick(recipe.id)}
    >
      {/* 背景圖片 */}
      <img 
        src={recipe.imageUrl} 
        alt={recipe.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 熱門標籤 - 左上角 */}
      {showPopularTag && (
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-[#E85A4F] text-white text-sm font-medium rounded-lg">
            熱門
          </span>
        </div>
      )}
      
      {/* 愛心按鈕 - 右上角（無背景） */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className="absolute top-3 right-3 transition-transform hover:scale-110"
        aria-label={recipe.isFavorite ? '取消收藏' : '加入收藏'}
      >
        <Heart 
          className={cn(
            "w-6 h-6",
            recipe.isFavorite 
              ? 'fill-white text-white' 
              : 'text-white/90 stroke-2'
          )} 
        />
      </button>
      
      {/* 分類標籤 - 左下角（黑底模糊） */}
      {showCategoryBadge && (
        <div className="absolute bottom-16 left-3">
          <span className="inline-block px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded">
            {recipe.category}
          </span>
        </div>
      )}
      
      {/* 底部資訊區（黑底模糊背景） */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/60 backdrop-blur-md">
        {/* 食譜標題 */}
        <h3 className={cn(
          "text-white font-bold mb-1.5 line-clamp-1",
          size === 'compact' ? 'text-base' : 'text-xl'
        )}>
          {recipe.name}
        </h3>
        
        {/* 份量與時間 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white">{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="text-primary-500">{recipe.cookTime}分鐘</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```


#### 2. 建立 `src/shared/components/recipe/RecipeCardGrid.tsx`

取代 `dashboard/RecipeSection` 的 Grid 佈局部分

```tsx
type RecipeCardGridProps = {
  title?: string;                      // 區塊標題
  recipes: RecipeListItem[];
  onRecipeClick: (id: string) => void;
  showMoreLink?: string;               // 「查看更多」連結
  columns?: 2 | 3 | 4;                 // Grid 欄數（預設 2）
  showPopularTag?: boolean;            // 是否顯示熱門標籤
}
```

#### 3. 建立 `src/shared/components/recipe/RecipeCardCarousel.tsx`

重新命名並遷移 `recipe/RecipeSection.tsx`

```tsx
type RecipeCardCarouselProps = {
  title: string;
  recipes: RecipeListItem[];
  onRecipeClick: (id: string) => void;
  showPopularTag?: boolean;
  showScrollButton?: boolean;          // 是否顯示滑動按鈕（預設 true）
}
```

---

### 階段二：更新使用方

#### Dashboard 模組

**檔案**：`src/modules/dashboard/components/RecipeSection.tsx`

**修改前**：
```tsx
import RecipeCard from './RecipeCard';
// 硬編碼卡片資料...
```

**修改後**：
```tsx
import { RecipeCardGrid } from '@/shared/components/recipe/RecipeCardGrid';
import { useRecipes } from '@/modules/recipe/hooks';

const RecipeSection = () => {
  const { recipes } = useRecipes(); // 或從 API 取得推薦食譜
  
  return (
    <RecipeCardGrid
      title="推薦食譜"
      recipes={recipes.slice(0, 2)}
      onRecipeClick={(id) => navigate(`/recipe/${id}`)}
      showMoreLink="/recipe"
      columns={2}
      showPopularTag
    />
  );
};
```

#### Recipe 模組

**檔案**：`src/modules/recipe/components/features/RecipeList.tsx`

**修改前**：
```tsx
import { RecipeSection } from '@/modules/recipe/components/ui/RecipeSection';
```

**修改後**：
```tsx
import { RecipeCardCarousel } from '@/shared/components/recipe/RecipeCardCarousel';

// 在 render 中
<RecipeCardCarousel
  title="快速煮"
  recipes={groupedRecipes.quick}
  onRecipeClick={handleRecipeClick}
  showPopularTag={false}
/>
```

---

### 階段三：移除舊元件

刪除以下檔案：

- ❌ `src/modules/dashboard/components/RecipeCard.tsx`
- ❌ `src/modules/recipe/components/ui/RecipeSectionCard.tsx`
- ❌ `src/modules/recipe/components/ui/RecipeSection.tsx`（遷移到 shared）
- ❌ `src/modules/recipe/components/ui/RecipeCard.tsx`（遷移到 shared）

---

## 最新設計稿分析（Dashboard 推薦食譜）

### 設計稿說明

![Dashboard 推薦食譜設計稿](file:///C:/Users/User/.gemini/antigravity/brain/87c33a00-0ba8-454a-bb6e-a49343a11f1a/uploaded_image_1764831466037.png)

根據最新的 Dashboard 設計稿，所有食譜卡片必須符合以下設計要求：

### 🎯 設計要求重點

#### 1. **圖片疊加文字佈局（必須）**
- ✅ **所有卡片**都必須採用圖片疊加文字的設計
- ❌ 不再使用「圖片上方 + 文字下方」的傳統卡片佈局
- 文字資訊全部疊加在圖片上方

#### 2. **半透明模糊背景（必須）**
- 文字區域必須有半透明黑底模糊效果 (`backdrop-blur`)
- 確保文字在任何圖片上都清晰可讀
- 模糊效果範圍：
  - 分類標籤：局部模糊背景
  - 底部資訊區：大範圍模糊背景

#### 3. **熱門標籤（可選）**
- 左側卡片：顯示「熱門」標籤（紅色圓角）
- 右側卡片：無「熱門」標籤
- **結論**：`showPopularTag` prop 必須可選控制

#### 4. **分類標籤位置**
- 位置：圖片左下角
- 樣式：半透明黑底 + 白色文字 + 模糊效果
- 範例：`bg-black/50 backdrop-blur-sm text-white`

#### 5. **愛心按鈕**
- 位置：右上角
- 樣式：白色輪廓圖示
- 背景：無背景（直接疊在圖片上）

#### 6. **底部資訊區**
- 標題：白色大字（粗體）
- 資訊列：
  - 人數圖標 + 白色文字
  - 時間圖標 + **紅色/橙色文字**（強調）
- 背景：黑色半透明 + 模糊效果

---

## 視覺設計統一標準（更新版）

### 設計稿對比

| 元素 | 舊版（Recipe 模組） | 新版（Dashboard 設計） |
|------|---------------------|----------------------|
| **佈局** | 圖片疊加（正確） | 圖片疊加（正確）✅ |
| **分類標籤底色** | 半透明白底 | **半透明黑底** ⚠️ |
| **愛心按鈕背景** | 有背景 (`p-1.5`) | **無背景** ⚠️ |
| **時間文字顏色** | 白色 | **紅色/橙色** ⚠️ |
| **底部區域模糊** | 漸層遮罩 | **模糊背景** ⚠️ |

基於最新的 Dashboard 設計稿樣式：

### 色彩系統
```css
/* 標籤與按鈕 */
熱門標籤：      bg-[#E85A4F] text-white rounded-lg (可選顯示)
愛心按鈕：      fill-white / text-white (收藏時)
              text-white/90 stroke-2 (未收藏)
              無背景，直接疊在圖片上

/* 分類標籤 - 更新為黑底 */
分類標籤：      bg-black/50 backdrop-blur-sm text-white
              位置：左下角

/* 底部資訊區 - 新增模糊背景 */
底部區域背景：   bg-black/60 backdrop-blur-md
標題文字：      text-white font-bold
人數文字：      text-white
時間文字：      text-primary-500 或 text-[#FF6B4A] (橙紅色強調)
```

### 間距與尺寸
```css
卡片圓角：      rounded-2xl (大卡片) / rounded-xl (小卡片)
標籤間距：      top-3 left-3 / right-3
底部 padding：  p-4
標題大小：      text-xl font-bold (大) / text-sm font-medium (小)
圖標大小：      w-4 h-4 (資訊區) / w-7 h-7 (愛心)
```

### 互動效果
```css
卡片 Hover：    shadow-lg → shadow-xl
愛心 Hover：    scale-110
圖片 Hover：    scale-105 (compact 變體)
```

---

## 資料介面統一

### 核心型別：`RecipeListItem`

```typescript
type RecipeListItem = {
  id: string;
  name: string;
  category: RecipeCategory;
  imageUrl: string;
  servings: number;
  cookTime: number;
  isFavorite?: boolean;
}
```

### Dashboard 資料轉換

**現有**：硬編碼 props（cover, tag, category, title, servings, time）

**改為**：從後端 API 或 mock 資料取得 `RecipeListItem[]`

```typescript
// src/modules/dashboard/services/dashboardApi.ts
export const getRecommendedRecipes = async (): Promise<RecipeListItem[]> => {
  // 回傳推薦食譜列表
}
```

---

## 遷移檢查清單

### 開發階段

- [ ] 建立 `src/shared/components/recipe/` 資料夾
- [ ] 建立 `RecipeCard.tsx`（整合 full/compact 變體）
- [ ] 建立 `RecipeCardGrid.tsx`
- [ ] 建立 `RecipeCardCarousel.tsx`
- [ ] 更新 `dashboard/RecipeSection.tsx` 使用新元件
- [ ] 更新 `recipe/RecipeList.tsx` 使用新元件
- [ ] 更新所有 import 路徑

### 測試階段

- [ ] Dashboard 首頁推薦食譜顯示正常
- [ ] Recipe 列表頁各區塊（快速煮、輕鬆煮、慢火煮）顯示正常
- [ ] 收藏功能正常運作
- [ ] 點擊卡片導航到詳情頁
- [ ] 水平捲動流暢
- [ ] RWD 響應式測試

### 清理階段

- [ ] 刪除舊元件檔案
- [ ] 移除未使用的 import
- [ ] 執行 lint 檢查
- [ ] 執行 TypeScript 編譯檢查

---

## 預期效益

1. **程式碼減少 ~40%**：5 個檔案整合為 3 個共用元件
2. **維護成本降低**：單一元件修改即可影響所有使用方
3. **設計一致性**：統一視覺風格和互動行為
4. **型別安全**：全面使用 `RecipeListItem` 介面
5. **可擴充性**：透過 props 輕鬆支援新變體

---

## 風險評估

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| 破壞現有功能 | 高 | 逐步遷移，保留舊元件直到測試完成 |
| Dashboard 資料串接問題 | 中 | 先使用 mock 資料，後續整合真實 API |
| 樣式不符預期 | 低 | 基於已驗證的設計稿（recipe/RecipeCard） |

---

## 下一步行動

### 1. ✅ 確認設計稿（已完成）

**最新設計稿要求**（Dashboard 推薦食譜）：
- ✅ 圖片疊加文字佈局（所有卡片統一）
- ✅ 半透明黑底模糊背景（分類標籤 + 底部資訊區）
- ✅ 熱門標籤可選顯示（左上角紅色圓角）
- ✅ 無背景愛心按鈕（白色輪廓）
- ✅ 時間文字橙紅色強調

### 2. 建立共用元件

**順序**：
1. 先建立 `shared/components/recipe/RecipeCard.tsx`（核心元件）
2. 建立 `shared/components/recipe/RecipeCardGrid.tsx`（Grid 容器）
3. 建立 `shared/components/recipe/RecipeCardCarousel.tsx`（水平捲動容器）

**程式碼規範**：
- ✅ 一律使用 `type` 定義型別（不用 `interface`）
- ✅ 一律使用箭頭函式
- ✅ 使用 `cn()` 工具處理條件樣式

### 3. 漸進式遷移

**第一階段**：Recipe 模組
- 更新 `RecipeList.tsx` 使用新的 `RecipeCardCarousel`
- 測試水平捲動功能

**第二階段**：Dashboard 模組
- 更新 `RecipeSection.tsx` 使用新的 `RecipeCardGrid`
- 整合推薦食譜 API（或 mock 資料）

### 4. 全面測試

**測試項目**：
- [ ] Dashboard 首頁推薦食譜顯示正常
- [ ] Recipe 列表頁各區塊顯示正常
- [ ] 熱門標籤在正確位置顯示/隱藏
- [ ] 模糊背景效果在各種圖片上都清晰可讀
- [ ] 時間文字顏色為橙紅色
- [ ] 收藏功能正常運作
- [ ] 點擊卡片導航正常
- [ ] RWD 響應式正常

### 5. 清理舊檔案

確認測試通過後，刪除以下舊元件：
- `src/modules/dashboard/components/RecipeCard.tsx`
- `src/modules/recipe/components/ui/RecipeSectionCard.tsx`
- `src/modules/recipe/components/ui/RecipeSection.tsx`
- `src/modules/recipe/components/ui/RecipeCard.tsx`

---

## 設計要求總結

### 🎨 關鍵設計變更

| 項目 | 舊設計 | 新設計（Dashboard 稿） |
|------|--------|----------------------|
| 佈局方式 | 部分卡片圖片+文字分離 | **全部圖片疊加文字** ✅ |
| 分類標籤 | 半透明白底 | **半透明黑底模糊** ✅ |
| 底部區域 | 漸層遮罩 | **黑底模糊背景** ✅ |
| 愛心按鈕 | 有圓形背景 | **無背景** ✅ |
| 時間文字 | 白色 | **橙紅色強調** ✅ |
| 熱門標籤 | 部分固定顯示 | **可選控制** ✅ |

### 💡 為什麼這樣設計？

1. **圖片疊加文字**：現代化設計，充分利用視覺空間
2. **模糊背景**：確保文字在任何背景圖片上都清晰可讀
3. **時間文字強調**：引導使用者注意烹飪時間（重要決策因素）
4. **熱門標籤可選**：提供彈性，避免所有卡片都顯得過於擁擠

---

> **提醒**：所有程式碼必須使用 `type` 定義型別和箭頭函式，符合專案慣例。
