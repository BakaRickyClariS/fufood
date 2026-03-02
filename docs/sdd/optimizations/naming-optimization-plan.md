# FuFood 檔名命名優化計畫（Inventory / Food Scan）

> 版本：v1.1  
> 範圍：`src/features/inventory`、`src/features/food-scan` 相關檔案與路由  
> 目標：統一前端元件與檔名命名規則，避免重複頁面／模組名稱，提升可讀性與可維護性

---

## 1. 命名原則總覽

### 1.1 基本規則

- 檔案命名
  - React 元件檔：`PascalCase.tsx`
  - Service / 常數：`camelCase.ts`
- 匯出命名
  - React 元件：與檔名同名 `PascalCase` 預設匯出
  - 常數 / 函式：具語意的 `camelCase` 或 `SCREAMING_SNAKE_CASE`（常數集合）

### 1.2 元件命名模板

- 完整模板：`[Domain][Entity][Kind]`
  - `Domain`：功能模組，例如 `Inventory`, `FoodScan`
  - `Entity`：資料主體，例如 `Category`, `Item`, `Food`, `Overview`
  - `Kind`：UI 類型，例如 `Card`, `Section`, `Tabs`, `Banner`, `Modal`, `Dialog`, `Page`, `View`
- **重要規則：資料夾已含頁面／模組名稱時，不重複命名**
  - 當路徑上已經包含模組或頁面名稱時（例如 `src/features/inventory/...`, `src/features/food-scan/...`, `src/routes/Inventory/...`），檔名只使用 `[Entity][Kind]`，不要再加上 `Inventory`、`FoodScan` 等前綴。
  - 只有在路徑無法表達 domain 時（例如 `shared/components`）才需要在檔名加上 `Domain` 前綴。

**範例**

- `CategoryCard`：位於 `src/features/inventory/components/CategoryCard.tsx`，不再重複 `Inventory`。
- `OverviewSection`：位於 `src/features/inventory/components/OverviewSection.tsx`。
- `ResultPage`：位於 `src/features/food-scan/components/ResultPage.tsx`。
- `InventoryBadge`：位於 `src/shared/components/InventoryBadge.tsx`，因為 shared 中沒有 feature 資訊，所以加上 `Inventory` 前綴。

### 1.3 UI 類型後綴

- `Card`：小型資訊卡片
- `Section`：畫面中一個區塊（可含多個 Card / 列表）
- `Tabs` / `TabsSection`：分頁切換 UI
- `Banner`：頂部橫幅／提示帶
- `Modal` / `Dialog`：彈出視窗（專案內建議統一一種）
- `Page` / `View`：完整頁面級元件（通常對應路由）

---

## 2. Inventory 模組命名分析與建議

路徑：`src/features/inventory`

### 2.1 現有檔案列表（截至目前）

- `components/`
  - `CategoryBanner.tsx`
  - `CategoryCard.tsx`
  - `CategorySection.tsx`
  - `CommonItemCard.tsx`
  - `CommonItemsSection.tsx`
  - `ExpiredRecordsSection.tsx`
  - `FoodCard.tsx`
  - `FoodDetailModal.tsx`
  - `InventoryCard.tsx`
  - `InventoryMainTabs.tsx`
  - `InventorySection.tsx`
  - `InventorySettingsSection.tsx`
  - `InventorySubTabs.tsx`
  - `TabsSection.tsx`
- `constants/`
  - `categories.ts`
  - `foodImages.ts`
- `services/`
  - `inventoryService.ts`
- `store/`
  - `inventorySlice.ts`

### 2.2 命名問題摘要

- 路徑已表達 domain，不需重複在檔名
  - `CategoryBanner`, `CategoryCard`, `CategorySection` 位於 `src/features/inventory/...`，路徑已經說明是 Inventory 模組，檔名不需要再加 `Inventory` 前綴。
- 命名語意有模糊空間
  - `CommonItemCard` / `CommonItemsSection` 中的 `Common` 意義不夠清楚，無法直接看出是「常用」還是「最愛」。
  - `ExpiredRecordsSection` 的「Records」偏資料層用語，不是使用者觀點。
- Tabs / Section 用語不夠具體
  - `InventoryCard`, `InventorySection`, `TabsSection`, `InventoryMainTabs`, `InventorySubTabs` 難以僅從名稱判斷是哪一層級或哪一個頁面的區塊。
- 食材／商品細節命名可再具體
  - `FoodCard`, `FoodDetailModal` 未直接表達是「單一品項卡片」與「品項詳細」。
- 常數檔案名稱過於 generic，但路徑已可辨識
  - `categories.ts`, `foodImages.ts` 單看檔名較 generic，不過由 `inventory/constants/` 路徑仍可判斷用途。

### 2.3 建議命名對照表

> 下表遵守「路徑已含模組名稱就不要重複」的規則，只在需要加強語意時調整 Entity / Kind。

#### 2.3.1 類別相關元件

| 目前檔名              | 建議新檔名                    | 原因說明                                               |
| --------------------- | ----------------------------- | ------------------------------------------------------ |
| `CategoryBanner.tsx`  | 保留現名                      | 路徑已含 `inventory`，檔名不再重複 domain 即可。      |
| `CategoryCard.tsx`    | 保留現名                      | 同上，維持簡短清楚。                                   |
| `CategorySection.tsx` | `CategoryOverviewSection.tsx` | 補上 `Overview`，更明確表達「分類總覽區塊」的角色。    |

#### 2.3.2 常用品項相關

| 目前檔名                | 建議新檔名                       | 原因說明                                   |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| `CommonItemCard.tsx`    | `FrequentItemCard.tsx` 或 `FavoriteItemCard.tsx` | `Common` 曖昧，改為更貼近實際的語意。      |
| `CommonItemsSection.tsx`| `FrequentItemsSection.tsx`       | 單複數一致，並保留由路徑表達 Inventory domain。 |

#### 2.3.3 過期／即將過期相關

| 目前檔名                   | 建議新檔名                   | 原因說明                                      |
| -------------------------- | ---------------------------- | --------------------------------------------- |
| `ExpiredRecordsSection.tsx`| `ExpiredItemsSection.tsx` 或 `ExpiringItemsSection.tsx` | 避免使用 `Records`，改為 user 語言的「品項」。 |

#### 2.3.4 庫存總覽／儀表板相關

| 目前檔名               | 建議新檔名            | 原因說明                                              |
| ---------------------- | --------------------- | ----------------------------------------------------- |
| `InventoryCard.tsx`    | `OverviewCard.tsx`    | 位於 inventory 模組底下，檔名不需再帶 `Inventory`。   |
| `InventorySection.tsx` | `OverviewSection.tsx` | 目前是儀表板區塊，名稱改為 Overview 並移除重複 domain。 |
| `TabsSection.tsx`      | `ViewTabsSection.tsx` | 補上 `View` 讓用途更明確，domain 由路徑表達即可。     |
| `InventoryMainTabs.tsx`| `PrimaryTabs.tsx`     | 表達「主頁籤」，避免重複 `Inventory`。                |
| `InventorySubTabs.tsx` | `SecondaryTabs.tsx`   | 與 `PrimaryTabs` 對應，表達次層級頁籤。               |

#### 2.3.5 食材／商品細節相關

| 目前檔名             | 建議新檔名                 | 原因說明                                                  |
| -------------------- | -------------------------- | --------------------------------------------------------- |
| `FoodCard.tsx`       | `FoodItemCard.tsx`         | 加上 `Item` 表達是「單一品項卡片」，domain 由路徑提供。  |
| `FoodDetailModal.tsx`| `FoodItemDetailDialog.tsx` | 加上 `Item` 與 `Detail`，語意完整；Modal / Dialog 擇一統一。 |

#### 2.3.6 常數／服務層

| 目前檔名          | 建議新檔名 | 原因說明                                              |
| ----------------- | ---------- | ----------------------------------------------------- |
| `categories.ts`   | 保留現名   | 檔案位於 `inventory/constants/`，路徑已表達 Inventory。 |
| `foodImages.ts`   | 保留現名   | 同上，從路徑可看出是 Inventory 專用圖片資源。         |
| `inventoryService.ts` | 保留    | Service 本身帶 domain 名稱是合理的。                  |
| `inventorySlice.ts`   | 保留    | Redux slice 命名恰當。                               |

---

## 3. Food Scan 模組命名分析與建議

路徑：`src/features/food-scan`  
相關路由：`src/routes/FoodInput/Upload.tsx`, `src/routes/FoodInput/ScanResult.tsx`

### 3.1 現有檔案列表（截至目前）

- `components/`
  - （目前為空）
- `hooks/`
  - （目前為空）
- `services/`
  - `ocrService.ts`
- `types/`
  - （目前為空）

### 3.2 命名問題摘要

- Food Scan 的 UI 還在 `routes/FoodInput` 中，尚未拆到 `features/food-scan/components/`。
- `Upload.tsx`, `ScanResult.tsx` 檔名過於 generic，難以從檔名判斷是「食材掃描」流程。
- `ocrService.ts` 在 Food Scan 底下，檔名雖然 generic，但由路徑仍可辨識用途。

### 3.3 路由級元件命名建議

> 依照「路徑已含 feature 名稱就不要重複」的規則，Page 級元件檔名不再帶 `FoodScan`。

| 目前路由檔案                          | 建議新檔名（於 features 下）                   | 備註                                           |
| ------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `src/routes/FoodInput/Upload.tsx`     | `src/features/food-scan/components/UploadPage.tsx` | 路徑已含 `food-scan`，檔名只保留 `UploadPage`。 |
| `src/routes/FoodInput/ScanResult.tsx` | `src/features/food-scan/components/ResultPage.tsx` | 同理，使用 `ResultPage` 即可。                 |

> 後續路由層可只負責組合與 `Outlet`，畫面由 `UploadPage`／`ResultPage` 承擔。

### 3.4 細部 UI 元件拆分命名建議

視未來拆分需要，可逐步把現有 `ScanResult` 內的 UI 拆成（皆位於 `src/features/food-scan/components`）：

- `ResultHeader.tsx`：包含返回按鈕與標題列。
- `ResultSummaryCard.tsx`：顯示商品圖片、名稱與辨識成功標章。
- `ResultDetailsSection.tsx`：顯示分類、保存條件等欄位列表。
- `ResultActionButtons.tsx`：例如「加入庫存」、「建立食譜」等 CTA。

命名遵循 `[Entity][Kind]`，由路徑表達 `FoodScan` domain。

### 3.5 Service 命名建議

| 目前檔名       | 建議新檔名 | 原因說明                                                         |
| -------------- | ---------- | ---------------------------------------------------------------- |
| `ocrService.ts`| 保留現名   | Service 已位於 `food-scan/services/`，domain 由路徑表達即可，不必再在檔名重複。 |

---

## 4. 落地步驟與驗收清單

### 4.1 執行步驟建議

1. **先從 Inventory 開始**
   - 依 2.3 的對照表批次調整檔名與元件名稱。
   - 使用 IDE rename refactor 更新所有 import。
2. **再調整 Food Scan**
   - 新增 `UploadPage.tsx`, `ResultPage.tsx` 並將現有路由畫面邏輯搬入。
   - 路由改為使用新的 Page 元件，逐步拆出較小元件（Header / Card / Section 等）。
3. **最後調整 service / constants**
   - 若未來有更多與 Food Scan 相關的 service，可持續沿用「由路徑表達 domain」的原則，避免在檔名重複。

### 4.2 驗收清單

- [ ] 檔名若位於 feature 目錄下，不再重複 feature 名稱（例如 `inventory`, `food-scan`）。
- [ ] 所有 Inventory 元件檔名皆符合 `[Entity][Kind].tsx` 或語意清楚的變形。
- [ ] `Common*` 類名稱已改為 `Frequent` 或其他語意明確字詞。
- [ ] 過期相關命名皆改為 `*Items*`，避免使用 `Records`。
- [ ] Food Scan 主要畫面已抽成 `UploadPage` 與 `ResultPage`。
- [ ] `food-scan` 相關 UI 元件命名皆符合 `[Entity][Kind].tsx`。
- [ ] 所有 import 已更新且 TypeScript 編譯無錯誤。
- [ ] ESLint / Prettier 無新增警告。

---

**維護者**：FuFood 開發團隊  
**最後更新**：2025-11-26

