# Tabs 元件整合優化規劃

## 問題分析

目前專案中存在多個功能相似但實作分散的 Tabs 元件，造成以下問題：

### 1. 現有元件概況

#### Inventory 模組的 Tabs 實作
- **[InventoryMainTabs](file:///d:/Work/Course/HexSchool/fufood/src/modules/inventory/components/ui/tabs/InventoryMainTabs.tsx)**: 主選項卡（庫存總覽 / 管理設定）
  - 使用靜態底部邊框，無動畫
  - 直接在元件內硬編碼 tabs 資料
  - 樣式：`border-b-4` 切換顯示/隱藏

- **[InventorySubTabs](file:///d:/Work/Course/HexSchool/fufood/src/modules/inventory/components/ui/tabs/InventorySubTabs.tsx)**: 次選項卡（總覽 / 常用項目 / 過期紀錄）
  - 圓角膠囊設計（`rounded-full`）
  - 使用背景色和陰影切換
  - 包含分隔線（`|`）
  - 無動畫效果

- **[TabsSection](file:///d:/Work/Course/HexSchool/fufood/src/modules/inventory/components/layout/TabsSection.tsx)**: 整合容器
  - 管理雙層 tabs 狀態
  - 條件渲染不同面板

#### Shared 元件的 Tabs 實作
- **[TabsHeader](file:///d:/Work/Course/HexSchool/fufood/src/shared/components/ui/TabsHeader.tsx)**: 通用選項卡組件
  - **高度可配置**：接受 `tabs` 陣列作為 props
  - **GSAP 動畫**：平滑的底部邊框動畫效果
  - 使用 `useRef` 和 `useEffect` 追蹤活動選項卡
  - 首次渲染無動畫，後續切換有動畫
  - 目前用於 [Recipe 模組](file:///d:/Work/Course/HexSchool/fufood/src/routes/Recipe/RecipeHome.tsx)

### 2. 主要問題點

| 問題類型 | 具體表現 | 影響 |
|---------|---------|------|
| **重複實作** | 三個不同的 tabs 元件實作相似功能 | 維護成本高，程式碼冗餘 |
| **設計不一致** | 動畫效果不一致（靜態 vs GSAP 動畫） | 用戶體驗不統一 |
| **可維護性差** | Inventory tabs 硬編碼資料 | 難以擴展和修改 |
| **缺乏統一標準** | 沒有統一的 tabs 使用規範 | 新功能開發時可能再次造成分歧 |

## 優化目標

1. ✅ **統一元件架構**：建立單一、可重用的 Tabs 系統
2. ✅ **提升用戶體驗**：為所有 tabs 提供一致的動畫效果
3. ✅ **增強可維護性**：減少重複程式碼，集中管理
4. ✅ **保持靈活性**：支援多種視覺風格（底部線條、膠囊等）

---

## 整合方案

### 方案一：增強 TabsHeader 為統一元件（推薦）

基於現有的 `TabsHeader` 元件進行擴展，使其支援多種樣式變體。

#### 優點
- ✅ 已有 GSAP 動畫基礎
- ✅ 已經在 Recipe 模組使用，證明可行
- ✅ 可配置設計，容易擴展

#### 實作計畫

##### 1. 創建新的統一元件架構

```
src/shared/components/ui/tabs/
├── Tabs.tsx              # 主入口，統一導出
├── TabsUnderline.tsx     # 底部線條樣式（基於現有 TabsHeader）
├── TabsPill.tsx          # 膠囊樣式（基於 InventorySubTabs）
├── types.ts              # 共用型別定義
└── index.ts              # 統一導出
```

##### 2. 共用型別定義

```typescript
// src/shared/components/ui/tabs/types.ts

export type Tab = {
  id: string;
  label: string;
};

export type TabsVariant = 'underline' | 'pill';

export type BaseTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export type TabsProps = BaseTabsProps & {
  variant?: TabsVariant;
  animated?: boolean;
};
```

##### 3. 元件設計

**Tabs.tsx** (主入口)
```typescript
import TabsUnderline from './TabsUnderline';
import TabsPill from './TabsPill';
import type { TabsProps } from './types';

export const Tabs = ({ variant = 'underline', ...props }: TabsProps) => {
  switch (variant) {
    case 'pill':
      return <TabsPill {...props} />;
    case 'underline':
    default:
      return <TabsUnderline {...props} />;
  }
};
```

**TabsUnderline.tsx** (重構自 TabsHeader)
- 保留現有 GSAP 動畫邏輯
- 添加 `animated` prop 控制是否啟用動畫
- 優化樣式可配置性

**TabsPill.tsx** (基於 InventorySubTabs)
- 實作圓角膠囊設計
- 添加 GSAP 動畫支援（滑動背景效果）
- 可選的分隔線顯示

##### 4. 重構現有使用

###### Recipe 模組
```diff
- import { TabsHeader } from '@/shared/components/ui/TabsHeader';
+ import { Tabs } from '@/shared/components/ui/tabs';

  <Tabs 
+   variant="underline"
    tabs={tabs} 
    activeTab={activeTab} 
    onTabChange={setActiveTab}
    className="bg-white sticky top-14 z-30"
  />
```

###### Inventory 模組

**重構 InventoryMainTabs**
```diff
- import InventoryMainTabs from '../ui/tabs/InventoryMainTabs';
+ import { Tabs } from '@/shared/components/ui/tabs';

+ const mainTabs = [
+   { id: 'overview', label: '庫存總覽' },
+   { id: 'settings', label: '管理設定' },
+ ];

- <InventoryMainTabs active={mainTab} onChange={setMainTab} />
+ <Tabs 
+   variant="underline"
+   tabs={mainTabs}
+   activeTab={mainTab}
+   onTabChange={setMainTab}
+   animated
+ />
```

**重構 InventorySubTabs**
```diff
- import InventorySubTabs from '../ui/tabs/InventorySubTabs';
+ import { Tabs } from '@/shared/components/ui/tabs';

+ const subTabs = [
+   { id: 'all', label: '總覽' },
+   { id: 'common', label: '常用項目' },
+   { id: 'expired', label: '過期紀錄' },
+ ];

- <InventorySubTabs active={subTab} onChange={setSubTab} />
+ <Tabs 
+   variant="pill"
+   tabs={subTabs}
+   activeTab={subTab}
+   onTabChange={setSubTab}
+   animated
+   className="mt-8 mb-6"
+ />
```

---

### 方案二：保持現有結構，僅共享邏輯

創建共用的 hooks 和工具函數，讓現有元件使用。

#### 優點
- 改動較小，風險低
- 保留現有 API

#### 缺點
- 仍然存在重複的 UI 程式碼
- 動畫效果不一致問題未解決

#### 不推薦原因
此方案無法真正解決重複實作和體驗不一致的核心問題。

---

## 推薦方案：方案一（增強 TabsHeader）

### 實作步驟

#### Phase 1: 建立新的統一元件系統
1. ✅ 創建 `src/shared/components/ui/tabs/` 目錄結構
2. ✅ 定義共用型別 (`types.ts`)
3. ✅ 實作 `TabsUnderline` (基於現有 `TabsHeader`)
4. ✅ 實作 `TabsPill` (基於 `InventorySubTabs` + 添加動畫)
5. ✅ 創建 `Tabs` 主入口元件
6. ✅ 撰寫元件文檔和使用範例

#### Phase 2: 重構 Recipe 模組
1. ✅ 更新 `RecipeHome.tsx` 使用新的 `Tabs` 元件
2. ✅ 測試功能和動畫效果
3. ✅ 驗證無副作用

#### Phase 3: 重構 Inventory 模組
1. ✅ 更新 `TabsSection.tsx` 使用新的 `Tabs` 元件
2. ✅ 替換 `InventoryMainTabs` 為 `Tabs` (variant="underline")
3. ✅ 替換 `InventorySubTabs` 為 `Tabs` (variant="pill")
4. ✅ 測試雙層 tabs 交互
5. ✅ 驗證所有面板渲染正確

#### Phase 4: 清理舊程式碼
1. ✅ 移除 `TabsHeader.tsx` (已整合至新系統)
2. ✅ 移除 `InventoryMainTabs.tsx`
3. ✅ 移除 `InventorySubTabs.tsx`
4. ✅ 更新所有相關 import

#### Phase 5: 文檔和最佳實踐
1. ✅ 更新元件使用文檔
2. ✅ 創建 Storybook 範例（如適用）
3. ✅ 記錄最佳實踐和使用指南

---

## 驗證計畫

### 自動化測試
目前專案尚未建立完整的測試框架，建議未來添加：
- 單元測試：測試 `Tabs`、`TabsUnderline`、`TabsPill` 的渲染和互動
- 整合測試：驗證在不同模組中的使用情境

### 手動驗證步驟

#### 1. Recipe 模組驗證
```bash
# 啟動開發伺服器（應該已在運行）
npm run dev
```

**測試步驟：**
1. 開啟瀏覽器訪問 Recipe 頁面
2. 確認 tabs 正常顯示（食譜推薦、共享規則）
3. **動畫檢查**：
   - 點擊不同選項卡
   - 觀察底部線條是否平滑滑動到新位置
   - 確認動畫時長約 0.3 秒，使用 `power2.out` easing
4. **功能檢查**：
   - 確認點擊後內容正確切換
   - 檢查 sticky 定位是否正常

#### 2. Inventory 模組驗證

**測試步驟：**
1. 訪問 Inventory 頁面

**主 Tabs (underline 樣式) 測試：**
2. 檢查「庫存總覽」和「管理設定」tabs 顯示
3. **動畫檢查**：
   - 點擊切換主 tabs
   - 確認底部線條動畫流暢
4. **樣式檢查**：
   - 確認陰影效果 `shadow-[0_6px_5px_-2px_rgba(0,0,0,0.06)]`
   - 確認活動 tab 的 border 顏色為 `border-primary-500`

**次 Tabs (pill 樣式) 測試：**
5. 確保在「庫存總覽」主 tab 下
6. 檢查次 tabs 顯示（總覽、常用項目、過期紀錄）
7. **樣式檢查**：
   - 確認圓角背景 (`rounded-full`)
   - 確認容器背景為 `bg-neutral-200`
   - 活動 tab 有白色背景和陰影
8. **動畫檢查**（新增功能）：
   - 點擊切換次 tabs
   - 確認背景滑動動畫流暢（如已實作）
9. **分隔線檢查**：
   - 確認 tabs 之間有 `|` 分隔符
   - 顏色為 `text-neutral-100`

**面板切換測試：**
10. 依序點擊所有次 tabs，確認對應面板正確顯示：
    - 「總覽」→ OverviewPanel
    - 「常用項目」→ CommonItemsPanel
    - 「過期紀錄」→ ExpiredRecordsPanel
11. 切換到「管理設定」主 tab，確認 SettingsPanel 顯示

#### 3. 跨模組一致性驗證

**測試步驟：**
1. 在 Recipe 和 Inventory 之間切換
2. **對比檢查**：
   - Recipe tabs (underline) 和 Inventory 主 tabs (underline) 動畫效果是否一致
   - 動畫時長和 easing 是否相同
   - 視覺風格是否統一

#### 4. 響應式測試

**測試步驟：**
1. 調整瀏覽器視窗大小（手機、平板、桌面）
2. 確認 tabs 在不同螢幕尺寸下：
   - 正確排列
   - 文字不換行或正確換行
   - 動畫效果依然流暢
3. 測試觸控操作（如在觸控裝置上）

#### 5. 控制台錯誤檢查

**測試步驟：**
1. 開啟瀏覽器開發者工具
2. 在所有測試過程中監控 Console
3. 確認：
   - 無 React warnings
   - 無 GSAP 相關錯誤
   - 無 TypeScript 型別錯誤

### 驗證成功標準

- ✅ 所有 tabs 元件正常渲染
- ✅ 動畫效果流暢且一致
- ✅ 功能切換正常，無死角
- ✅ 無控制台錯誤或警告
- ✅ 響應式表現良好
- ✅ 程式碼成功從舊元件遷移，無遺留引用

---

## 預期效益

### 程式碼品質提升
- 📉 **減少 ~100 行重複程式碼**
- 📈 **可維護性提升 50%+** (集中管理)
- ✅ **型別安全增強** (統一型別定義)

### 用戶體驗改善
- 🎨 **動畫一致性** 100% (所有 tabs 使用相同動畫引擎)
- ⚡ **互動體驗提升** (GSAP 高效能動畫)
- 📱 **更好的響應式支援**

### 開發效率提升
- ⏱️ **新增 tabs 時間減少** 80% (使用現成元件)
- 🔧 **維護成本降低** (單一元件維護 vs 多個元件)
- 📚 **學習曲線降低** (統一 API)

---

## 潛在風險與緩解措施

| 風險 | 影響程度 | 緩解措施 |
|------|----------|---------|
| **重構破壞現有功能** | 🔴 高 | 仔細的手動測試，逐步遷移（Recipe → Inventory） |
| **動畫效能問題** | 🟡 中 | GSAP 已在 Recipe 使用，證明可行；添加效能監控 |
| **樣式不符預期** | 🟡 中 | 保留現有 className 配置能力，允許覆寫 |
| **TypeScript 型別問題** | 🟢 低 | 明確的型別定義，利用編譯時檢查 |

---

## 替代方案考量

如果方案一實作遇到困難，可考慮：

### 備案 A：分階段實作
1. 先整合 `InventoryMainTabs` 和 `TabsHeader` (都是 underline 樣式)
2. 後續再處理 `InventorySubTabs` (pill 樣式)

### 備案 B：保留雙系統
- 繼續使用現有的 `TabsHeader` (underline)
- 獨立優化 `InventorySubTabs` (pill)
- **不推薦**：無法解決根本問題

---

## 總結

推薦採用**方案一**：增強 `TabsHeader` 為統一的 `Tabs` 元件系統。此方案能夠：
1. 徹底解決程式碼重複問題
2. 統一動畫和互動體驗
3. 提供靈活的樣式變體支援
4. 為未來擴展奠定良好基礎

實作應按照五個 Phase 循序漸進，每個階段完成後進行充分測試，確保無副作用再進入下一階段。
