# Recipe 與 Inventory 頁面共用元件重構計畫

## 📋 分析總結

根據設計稿和現有程式碼分析，Recipe 頁面的上方區域與 Inventory 頁面有多處相似之處，可以共用以下元件：

### 設計稿分析

![設計稿](file:///C:/Users/User/.gemini/antigravity/brain/3343858b-1616-432f-9d83-97b8aa201244/uploaded_image_1764730905191.png)

從設計稿可以看到 Recipe 頁面包含：
1. **頂部區域**：左側有成員頭像群組、中間顯示 "My Home" 下拉選單、右側有首頁圖示和使用者頭像
2. **分頁標籤**：「共享規則」和「食譜推薦」兩個標籤
3. **Hero Card 區域**：淺粉色背景的 FuFood.ai 搜尋卡片，包含搜尋輸入框、標籤按鈕、剩餘次數提示
4. **主題探索**：橫向滾動的分類圖示（中式料理、美式料理等）
5. **慢火煮**：食譜卡片列表

### 現有程式碼結構對比

#### Inventory 頁面 ([index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Inventory/index.tsx))
```tsx
<HeroCard>
  <MemberList />
</HeroCard>
<TabsSection />
```

- **HeroCard**：提供帶有模糊背景和陰影的卡片容器
- **MemberList**：顯示成員頭像群組和「家人共享」標題
- **TabsSection**：包含多個分頁（總覽、常見、過期、設定）

#### Recipe 頁面 ([RecipeList.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/components/features/RecipeList.tsx))
```tsx
<div className="px-4">
  <SearchBar value={searchQuery} onChange={setSearchQuery} />
</div>
<div className="pl-4">
  <CategorySection selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
</div>
```

- **SearchBar**：簡單的搜尋輸入框
- **CategorySection**：橫向滾動的分類按鈕

---

## 🎯 可共用的元件

### 1. **HeroCard 容器**
**位置**：`src/modules/inventory/components/ui/other/HeroSection.tsx`

**功能**：
- 提供帶有模糊背景效果的粉色漸層
- 白色圓角卡片容器，帶陰影
- 響應式最大寬度控制

**建議**：
- ✅ 可直接共用
- 移至 `src/shared/components/ui/` 成為共用元件
- Recipe 頁面可用此容器包裹 FuFood.ai 搜尋區域

### 2. **MemberList 成員列表**
**位置**：`src/modules/inventory/components/layout/MemberList.tsx`

**功能**：
- 顯示重疊排列的成員頭像
- 顯示「家人共享」標題

**建議**：
- ✅ 可直接共用
- 移至 `src/shared/components/features/` 成為共用元件
- Recipe 頁面頂部區域可使用此元件顯示成員頭像（設計稿左上角）

### 3. **SearchBar 搜尋列**
**位置**：`src/modules/recipe/components/layout/SearchBar.tsx`

**功能**：
- 提供基礎搜尋輸入框
- 帶有搜尋圖示
- 支援佔位符文字自訂

**建議**：
- ⚠️ 需要改良後共用
- Recipe 的設計稿顯示更複雜的搜尋區域（包含 AI 詢問功能、標籤按鈕）
- Inventory 的 CategoryPage 使用點擊式搜尋（開啟 SearchModal）
- 建議保留各自的實作，或建立更靈活的共用版本

### 4. **CategorySection 分類區域**
**位置**：`src/modules/recipe/components/layout/CategorySection.tsx`

**功能**：
- 橫向滾動的分類按鈕
- 支援選中狀態切換
- 圓角按鈕樣式

**建議**：
- ✅ 可改良後共用
- 樣式與設計稿中的「主題探索」分類圖示不同（設計稿使用圖示+文字）
- 可建立更靈活的 `CategoryChips` 元件支援純文字和圖示+文字兩種模式
- Inventory 可能也需要分類篩選功能

---

## 📝 需審核的設計決策

> [!IMPORTANT]
> **設計稿與現有 Recipe 頁面的差異**
> 
> 設計稿顯示的 Recipe 頁面包含：
> - 頂部成員列表（類似 Inventory）
> - "My Home" 下拉選單（目前未實作）
> - 分頁標籤：「共享規則」和「食譜推薦」（目前 Recipe 只有單一列表頁）
> - FuFood.ai 搜尋卡片（帶有 AI 詢問功能和標籤按鈕）
> - 主題探索（帶圖示的分類）
> 
> **目前的 Recipe 頁面** 只有：
> - 簡單的搜尋輸入框
> - 純文字的分類按鈕
> - 食譜卡片列表
> 
> **問題**：是否要將 Recipe 頁面重構為與設計稿完全一致？還是只提取可共用的元件部分？

> [!WARNING]
> **HeroCard 背景效果**
> 
> 目前 `HeroCard` 的模糊背景使用 CSS class `body-dashboard-bg`，需確認此 class 是否定義在全域 CSS 中。如果是特定於 Inventory 的樣式，移至 shared 時需要一併處理。

---

## 🔧 建議的修改方案

### 方案 A：最小化共用（推薦）

**範圍**：只共用確定可複用的元件，保留各頁面的獨特性

#### 1. 共用 HeroCard
- **目標檔案**：`src/shared/components/ui/HeroCard.tsx`
- **修改項目**：
  - 從 `src/modules/inventory/components/ui/other/HeroSection.tsx` 複製並重新命名
  - 確保 `body-dashboard-bg` CSS class 在全域樣式中定義
  - 更新 Inventory 頁面的 import 路徑
- **使用場景**：
  - Inventory 首頁（現有）
  - Recipe 頁面的 FuFood.ai 搜尋卡片區域（新增）

#### 2. 共用 MemberList
- **目標檔案**：`src/shared/components/features/MemberList.tsx`
- **修改項目**：
  - 從 `src/modules/inventory/components/layout/MemberList.tsx` 移動
  - 支援自訂標題 prop（預設為「家人共享」）
  - 支援自訂成員資料 prop（避免硬編碼）
  - 更新 Inventory 頁面的 import 路徑
- **使用場景**：
  - Inventory 首頁（現有）
  - Recipe 頁面頂部（如果要按設計稿實作）

#### 3. 保留各自的 SearchBar 和 CategorySection
- **原因**：兩個頁面的需求差異較大
- **建議**：等未來有明確的共用需求時再考慮重構

---

### 方案 B：完整重構（符合設計稿）

**範圍**：將 Recipe 頁面完全重構為與設計稿一致

#### 1. 建立共用的 App Header
- **目標檔案**：`src/shared/components/layout/AppHeader.tsx`
- **內容**：
  - 左側：MemberList（縮小版，只顯示頭像）
  - 中間："My Home" 下拉選單
  - 右側：首頁圖示、使用者頭像
- **使用場景**：Inventory 和 Recipe 頁面通用

#### 2. 建立共用的 TabsHeader
- **目標檔案**：`src/shared/components/ui/TabsHeader.tsx`
- **內容**：可配置的分頁標籤組件
- **使用場景**：
  - Inventory：總覽、常見、過期、設定
  - Recipe：共享規則、食譜推薦

#### 3. 建立增強版 SearchCard
- **目標檔案**：`src/modules/recipe/components/ui/AISearchCard.tsx`
- **內容**：
  - 使用 HeroCard 包裹
  - FuFood.ai logo 和標題
  - 搜尋輸入框（帶圖示和箭頭按鈕）
  - 標籤按鈕群組
  - 剩餘次數提示
- **使用場景**：Recipe 頁面專用

#### 4. 建立增強版 CategoryGrid
- **目標檔案**：`src/shared/components/ui/CategoryGrid.tsx`
- **內容**：
  - 支援圖示+文字的分類卡片
  - 橫向滾動
  - 響應式排列
- **使用場景**：Recipe 的主題探索、可能的 Inventory 分類

#### 5. 重構 Recipe 頁面結構
- **目標檔案**：`src/routes/Recipe/RecipeHome.tsx`（新增）
- **結構**：
```tsx
<AppHeader />
<TabsHeader tabs={['共享規則', '食譜推薦']} />
<AISearchCard />
<div className="px-4">
  <h2>主題探索</h2>
  <CategoryGrid categories={RECIPE_CATEGORIES} />
</div>
<div className="px-4">
  <h2>慢火煮</h2>
  <RecipeList />
</div>
```

---

## ✅ 驗證計畫

### 自動化測試
由於這些是 UI 元件，主要依賴視覺驗證。建議：
- 建立 Storybook stories（如果專案有使用）
- 編寫簡單的快照測試確保元件渲染正確

### 手動驗證步驟

#### 1. 驗證 HeroCard 共用
- [ ] 啟動開發伺服器：`npm run dev`
- [ ] 瀏覽 Inventory 頁面，確認 HeroCard 樣式正常（模糊背景、陰影、圓角）
- [ ] 如採用方案 A/B，瀏覽 Recipe 頁面，確認新增的 HeroCard 區域樣式一致
- [ ] 測試響應式：調整瀏覽器寬度，確認最大寬度限制生效

#### 2. 驗證 MemberList 共用
- [ ] 瀏覽 Inventory 頁面，確認成員頭像和標題顯示正常
- [ ] 如採用方案 B，瀏覽 Recipe 頁面，確認頂部成員頭像顯示正常
- [ ] 確認頭像重疊效果正確

#### 3. 驗證整體佈局（方案 B）
- [ ] 對照設計稿，確認 Recipe 頁面結構一致
- [ ] 確認所有互動功能正常（分頁切換、搜尋、分類選擇）
- [ ] 測試捲動行為（分類橫向滾動、頁面垂直滾動）

#### 4. 檢查 Console 錯誤
- [ ] 開啟瀏覽器開發者工具
- [ ] 確認沒有 import 錯誤
- [ ] 確認沒有 CSS class 未定義的警告

---

## 🤔 需要使用者決策的問題

1. **選擇修改方案**：
   - 方案 A（最小化共用）：快速實作，低風險，保留各頁面特色
   - 方案 B（完整重構）：完全符合設計稿，統一使用者體驗，但工作量較大

2. **設計稿實作範圍**：
   - 是否要實作 "My Home" 下拉選單？（目前未見相關功能需求）
   - 「共享規則」分頁的內容是什麼？（設計稿未顯示）
   - FuFood.ai 搜尋卡片的後端 API 是否已準備好？

3. **成員管理**：
   - 成員資料是否應該從 API 獲取？還是繼續使用靜態資料？
   - 是否所有頁面都需要顯示成員列表？

4. **CSS 樣式管理**：
   - `body-dashboard-bg` class 如果不在全域 CSS 中，是否要移至全域？還是重新命名為更通用的名稱？

---

## 📂 檔案變更摘要

### 方案 A 檔案清單

#### [NEW] [HeroCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/ui/HeroCard.tsx)
從 Inventory 模組移至 shared，成為通用卡片容器。

#### [NEW] [MemberList.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/features/MemberList.tsx)
從 Inventory 模組移至 shared，支援自訂 props。

#### [MODIFY] [Inventory/index.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Inventory/index.tsx)
更新 import 路徑，指向新的共用元件位置。

#### [MODIFY] [CategoryPage.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Inventory/CategoryPage.tsx)
更新 HeroCard 的 import 路徑。

#### [DELETE] [HeroSection.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/components/ui/other/HeroSection.tsx)
已移至 shared。

#### [DELETE] [MemberList.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/inventory/components/layout/MemberList.tsx)
已移至 shared。

---

### 方案 B 額外檔案清單

#### [NEW] [AppHeader.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/layout/AppHeader.tsx)
統一的頂部 Header，包含成員頭像、Home 選單、圖示。

#### [NEW] [TabsHeader.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/ui/TabsHeader.tsx)
通用的分頁標籤元件。

#### [NEW] [AISearchCard.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/recipe/components/ui/AISearchCard.tsx)
Recipe 專用的 AI 搜尋卡片。

#### [NEW] [CategoryGrid.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/shared/components/ui/CategoryGrid.tsx)
支援圖示的分類網格/滾動列表。

#### [NEW] [RecipeHome.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Recipe/RecipeHome.tsx)
重構後的 Recipe 首頁，整合所有新元件。

#### [MODIFY] [RecipeLayout.tsx](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/routes/Recipe/RecipeLayout.tsx)
更新路由結構，支援新的頁面佈局。

---

## 📅 實作建議順序

### 方案 A
1. 檢查並處理 `body-dashboard-bg` CSS class
2. 建立 `src/shared/components/ui/HeroCard.tsx`
3. 建立 `src/shared/components/features/MemberList.tsx`（加入 props 支援）
4. 更新 Inventory 相關檔案的 import
5. 測試 Inventory 頁面功能
6. （可選）在 Recipe 頁面使用 HeroCard

### 方案 B
1. 執行方案 A 的步驟 1-5
2. 建立 `AppHeader` 元件
3. 建立 `TabsHeader` 元件
4. 建立 `AISearchCard` 元件
5. 建立 `CategoryGrid` 元件
6. 建立新的 `RecipeHome` 頁面
7. 更新路由配置
8. 整合所有元件並測試

---

## 💡 其他建議

### 樣式一致性
- 考慮建立設計系統的顏色變數（如果尚未有）
- 統一圓角大小（目前有 `rounded-xl`、`rounded-2xl`、`rounded-full`）
- 統一陰影樣式

### 效能優化
- 使用 `React.memo` 包裹純展示性元件（如 MemberList）
- 圖片考慮使用 lazy loading

### 可訪問性
- 為所有互動元素加入適當的 `aria-label`
- 確保鍵盤導航支援

### 未來擴展
- 如果「共享規則」和「食譜推薦」確實是兩個不同的分頁，建議使用 Tab 路由管理
- 考慮將成員管理功能獨立出來（選擇成員、編輯成員等）
