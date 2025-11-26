# FuFood 專案優化計畫

> **版本**: v1.0  
> **建立日期**: 2025-11-26  
> **目標**: 重構專案架構以符合 Next.js 無痛轉換、統一命名規範、資料邏輯分離

---

## 📋 目錄

- [專案現況分析](#專案現況分析)
- [優化目標](#優化目標)
- [優化方案](#優化方案)
  - [1. 專案架構重組（Next.js 相容）](#1-專案架構重組nextjs-相容)
  - [2. 命名邏輯統一化](#2-命名邏輯統一化)
  - [3. 資料與邏輯分離](#3-資料與邏輯分離)
- [遷移步驟建議](#遷移步驟建議)
- [驗證檢查清單](#驗證檢查清單)

---

## 專案現況分析

### 目前專案結構

```
src/
├── assets/              # 靜態資源（圖片、logos）
├── api/                 # API 請求函式
│   ├── auth.ts
│   ├── inventory.ts
│   ├── ocr.ts
│   └── recipe.ts
├── components/          # UI 元件
│   ├── feedback/        # 反饋元件
│   ├── forms/           # 表單元件
│   ├── global/          # 全域元件
│   ├── layout/          # 版面配置元件
│   │   └── inventory/   # 庫存相關版面元件
│   └── ui/              # 基礎 UI 元件（shadcn/ui）
├── config/              # 配置檔
├── data/                # 靜態資料
│   ├── categories.ts
│   ├── foodIImg.ts
│   └── layoutPattern.ts
├── functions/           # 工具函式
├── hooks/               # React Hooks
├── lib/                 # 第三方函式庫設定
├── routes/              # 頁面路由元件
│   ├── Auth/            # 認證相關頁面
│   ├── Dashboard/       # 主控台
│   ├── FoodInput/       # 食材輸入相關頁面
│   ├── Inventory/       # 庫存管理頁面
│   ├── Recipe/          # 食譜頁面
│   └── Settings/        # 設定頁面
├── store/               # Redux 狀態管理
├── style/               # 樣式系統
│   ├── base/
│   ├── components/
│   ├── themes/
│   ├── tokens/
│   └── utilities/
├── types/               # TypeScript 型別定義
│   ├── api/
│   ├── components/
│   └── shared/
├── utils/               # 工具函式
├── Layout.tsx           # 根版面配置
├── Router.tsx           # 路由配置
└── main.tsx             # 應用入口
```

### 現況優缺點分析

#### ✅ 優點
- 已有基本的資料夾分類（`components`、`routes`、`api` 等）
- 使用 TypeScript 提供型別安全
- 部分元件有子資料夾分類（如 `components/layout/inventory/`）

#### ⚠️ 待優化項目

1. **架構問題**
   - `components` 與 `routes` 分離不夠明確，部分頁面邏輯混在一起
   - Next.js 慣用的 `app` 或 `pages` 資料夾結構不明確
   - 缺少 `features` 或模組化設計，難以擴展

2. **命名不一致**
   - `data/foodIImg.ts` 與 `data/categories.ts` 命名風格不統一
   - `functions` 與 `utils` 職責重疊，命名不明確
   - `components/ui` 與 `components/layout` 界線模糊

3. **資料與邏輯混雜**
   - 元件內可能包含靜態資料、業務邏輯、UI 邏輯
   - 缺少明確的 `constants` 或 `configs` 分離
   - API 回應處理邏輯可能散落在元件中

---

## 優化目標

### 🎯 核心目標

1. **Next.js 無痛轉換**：建立與 Next.js App Router 相容的專案架構
2. **命名統一**：同性質檔案用資料夾歸類，避免檔名過度描述功能
3. **關注點分離**：元件只負責 UI 呈現，資料、邏輯、配置獨立管理

### 📊 預期效益

- ✅ 專案結構清晰，新成員快速上手
- ✅ 易於測試與維護
- ✅ 遷移至 Next.js 時只需調整路由與 SSR 邏輯
- ✅ 程式碼重用性提升

---

## 優化方案

### 1. 專案架構重組（Next.js 相容）

#### 📁 新架構設計

```
src/
├── pages/                        # Next.js Pages Router 相容結構（未來遷移時使用）
│   ├── _app.tsx                  # 自訂 App 元件（全域設定）
│   ├── _document.tsx             # 自訂 Document 元件（HTML 結構）
│   ├── index.tsx                 # 首頁 (Dashboard)
│   ├── login.tsx                 # 登入頁面
│   ├── register.tsx              # 註冊頁面
│   ├── inventory/
│   │   ├── index.tsx             # 庫存首頁
│   │   └── [categoryId].tsx     # 動態分類頁面
│   ├── recipe/
│   │   └── index.tsx             # 食譜頁面
│   ├── food-scan/
│   │   ├── upload.tsx            # 上傳頁面
│   │   └── scan-result.tsx      # 掃描結果頁面
│   └── settings/
│       ├── index.tsx             # 設定首頁
│       ├── profile.tsx           # 個人資料設定
│       ├── notifications.tsx     # 通知設定
│       └── subscription.tsx      # 訂閱方案設定
│
├── features/                     # 功能模組（Feature-based 架構）
│   ├── auth/                     # 認證功能模組
│   │   ├── components/           # 認證相關元件
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── services/             # 認證 API 服務
│   │   │   └── authService.ts
│   │   ├── hooks/                # 認證相關 hooks
│   │   │   └── useAuth.ts
│   │   ├── store/                # 認證狀態管理
│   │   │   └── authSlice.ts
│   │   ├── types/                # 認證型別定義
│   │   │   └── auth.types.ts
│   │   └── constants/            # 認證常數
│   │       └── authConstants.ts
│   │
│   ├── inventory/                # 庫存管理功能模組
│   │   ├── components/
│   │   │   ├── InventoryCard.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── FoodCard.tsx
│   │   │   └── FilterModal.tsx
│   │   ├── services/
│   │   │   └── inventoryService.ts
│   │   ├── hooks/
│   │   │   └── useInventory.ts
│   │   ├── store/
│   │   │   └── inventorySlice.ts
│   │   ├── types/
│   │   │   └── inventory.types.ts
│   │   └── constants/
│   │       ├── categories.ts     # 分類資料
│   │       └── defaultItems.ts   # 預設項目
│   │
│   ├── recipe/                   # 食譜功能模組
│   │   ├── components/
│   │   │   ├── RecipeCard.tsx
│   │   │   └── AiRecommendCard.tsx
│   │   ├── services/
│   │   │   └── recipeService.ts
│   │   ├── hooks/
│   │   │   └── useRecipe.ts
│   │   ├── store/
│   │   │   └── recipeSlice.ts
│   │   └── types/
│   │       └── recipe.types.ts
│   │
│   ├── food-scan/                # 食材掃描入庫功能模組
│   │   ├── components/
│   │   │   ├── Upload.tsx
│   │   │   └── ScanResult.tsx
│   │   ├── services/
│   │   │   ├── ocrService.ts
│   │   │   └── imageService.ts
│   │   ├── hooks/
│   │   │   └── useImageUpload.ts
│   │   └── types/
│   │       └── foodScan.types.ts
│   │
│   └── settings/                 # 設定功能模組
│       ├── components/
│       │   ├── ProfileSettings.tsx
│       │   ├── NotificationSettings.tsx
│       │   └── SubscriptionSettings.tsx
│       ├── services/
│       │   └── settingsService.ts
│       └── types/
│           └── settings.types.ts
│
├── shared/                       # 共用資源（跨功能共用）
│   ├── components/               # 共用 UI 元件
│   │   ├── ui/                   # shadcn/ui 原始元件（全小寫，不應修改）
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   ├── common/               # 客製化共用元件（PascalCase）
│   │   │   ├── DataCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ...
│   │   ├── layout/               # 版面配置元件
│   │   │   ├── TopNav.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── HeroCard.tsx
│   │   │   └── AppContainer.tsx
│   │   └── feedback/             # 回饋元件
│   │       └── SWPrompt.tsx
│   │
│   ├── hooks/                    # 共用 Hooks
│   │   ├── useWindowSize.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/                    # 工具函式
│   │   ├── format/               # 格式化工具
│   │   │   ├── dateFormat.ts
│   │   │   └── numberFormat.ts
│   │   ├── validation/           # 驗證工具
│   │   │   └── validators.ts
│   │   └── helpers/              # 輔助函式
│   │       └── common.ts
│   │
│   ├── constants/                # 共用常數
│   │   ├── routes.ts             # 路由常數
│   │   ├── apiEndpoints.ts       # API 端點
│   │   └── appConfig.ts          # 應用配置
│   │
│   └── types/                    # 共用型別定義
│       ├── common.types.ts
│       └── api.types.ts
│
├── styles/                       # 全域樣式系統
│   ├── base/                     # 基礎樣式
│   ├── themes/                   # 主題配置
│   ├── tokens/                   # 設計 tokens
│   └── utilities/                # 工具樣式
│
├── lib/                          # 第三方函式庫配置
│   ├── axios.ts                  # Axios 實例配置
│   ├── reactQuery.ts             # React Query 配置
│   └── redux.ts                  # Redux store 配置
│
├── assets/                       # 靜態資源
│   ├── images/
│   └── logos/
│
├── Router.tsx                    # 路由配置（React Router）
└── main.tsx                      # 應用入口
```

#### 🔑 架構設計原則

##### Feature-based 模組化設計

每個功能模組（`features/`）包含：
- **components**: 該功能專屬的 UI 元件
- **services**: API 請求邏輯
- **hooks**: 該功能的自訂 hooks
- **store**: 狀態管理（Redux slice）
- **types**: TypeScript 型別定義
- **constants**: 該功能的常數、配置、預設資料

##### 共用與專屬分離

- **`shared/`**: 跨功能共用的元件、工具、型別
- **`features/[feature]/`**: 功能專屬邏輯，避免跨功能依賴

##### UI 元件組織策略

UI 元件分為三個層級：

1. **shadcn/ui 原始元件**（`shared/components/ui/`）
   - 從 shadcn/ui 產生的基礎元件
   - 檔案命名：**全小寫** kebab-case（如 `button.tsx`, `dropdown-menu.tsx`）
   - **不應修改**：保持與 shadcn/ui 同步，方便升級
   - 範例：`button.tsx`, `card.tsx`, `input.tsx`, `tabs.tsx`, `sheet.tsx`

2. **客製化共用元件**（`shared/components/common/`）
   - 基於 shadcn/ui 元件組合的客製化元件
   - 跨多個功能模組使用的通用元件
   - 檔案命名：**PascalCase**（如 `DataCard.tsx`, `StatusBadge.tsx`）
   - 範例：`DataCard.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`

3. **功能專屬元件**（`features/[feature]/components/`）
   - 僅在單一功能模組中使用的元件
   - 檔案命名：**PascalCase**（如 `InventoryCard.tsx`, `RecipeCard.tsx`）
   - 範例：
     - `features/inventory/components/InventoryCard.tsx`
     - `features/recipe/components/RecipeCard.tsx`
     - `features/food-scan/components/ScanResult.tsx`

**決策流程圖**：
```
需要新增 UI 元件？
│
├─ 是否為 shadcn/ui 元件？
│  └─ 是 → shared/components/ui/ (全小寫)
│
├─ 是否在 2+ 功能模組中使用？
│  └─ 是 → shared/components/common/ (PascalCase)
│
└─ 否（只在單一功能中使用）
   └─ features/[feature]/components/ (PascalCase)
```

##### Next.js 相容性

- **`pages/` 資料夾**：預留 Next.js Pages Router 結構
  - 使用檔案系統路由（File-based Routing）
  - `pages/index.tsx` → `/` 路由
  - `pages/inventory/[categoryId].tsx` → `/inventory/:categoryId` 動態路由
  - `_app.tsx` 處理全域設定（Provider、Layout）
- **目前使用 `Router.tsx`**：保持 React Router 運作
- **遷移策略**：
  1. 保留 `features/` 架構不變
  2. 將 `pages/[route].tsx` 設為路由入口
  3. 頁面元件引用 `features/` 內的功能模組
  4. 只需調整路由與 SSR/SSG 邏輯（`getServerSideProps`, `getStaticProps`）

---

### 2. 命名邏輯統一化

#### 📌 命名規範

##### 資料夾命名

| 類型           | 命名規則       | 範例                                    |
|----------------|----------------|-----------------------------------------|
| 功能模組       | kebab-case     | `food-scan`, `inventory`, `user-profile` |
| 元件資料夾     | PascalCase     | `LoginForm`, `RecipeCard`               |
| 工具/服務      | camelCase 複數 | `utils`, `services`, `hooks`            |

##### 檔案命名

| 檔案類型           | 命名規則          | 範例                                   |
|--------------------|-------------------|----------------------------------------|
| React 元件         | PascalCase.tsx    | `LoginForm.tsx`, `RecipeCard.tsx`      |
| Hooks              | use[Name].ts      | `useAuth.ts`, `useInventory.ts`        |
| Service            | [name]Service.ts  | `authService.ts`, `recipeService.ts`   |
| 型別定義           | [name].types.ts   | `auth.types.ts`, `recipe.types.ts`     |
| 常數/配置          | [name]Constants.ts / [name]Config.ts | `authConstants.ts`, `appConfig.ts` |
| 工具函式           | [name].ts         | `dateFormat.ts`, `validators.ts`       |

#### 🔄 重新組織範例

##### 目前結構（不統一）

```
src/
├── functions/
│   ├── dateUtils.ts
│   └── stringHelpers.ts
├── utils/
│   ├── api.ts
│   └── format.ts
├── data/
│   ├── categories.ts
│   ├── foodIImg.ts          ❌ 命名不一致
│   └── layoutPattern.ts
```

##### 優化後結構（統一）

```
src/
├── shared/
│   ├── utils/                  ✅ 統一在 utils 資料夾
│   │   ├── format/
│   │   │   ├── dateFormat.ts   ✅ 用資料夾分類，而非檔名
│   │   │   └── stringFormat.ts
│   │   ├── validation/
│   │   │   └── validators.ts
│   │   └── helpers/
│   │       └── common.ts
│   └── constants/
│       ├── routes.ts
│       └── apiEndpoints.ts
│
├── features/
│   └── inventory/
│       ├── constants/
│       │   ├── categories.ts     ✅ 功能專屬資料放在功能模組內
│       │   ├── foodImages.ts     ✅ 修正命名
│       │   └── layoutPatterns.ts ✅ 修正命名
```

---

### 3. 資料與邏輯分離

#### 🎯 分離原則

##### 元件職責單一化

- **UI 元件**：只負責渲染，不包含業務邏輯
- **Hooks**：處理狀態管理與副作用
- **Services**：處理 API 請求與資料轉換
- **Constants**：靜態資料、配置、預設值

##### 分離範例

###### ❌ 優化前：元件內混雜資料與邏輯

```tsx
// src/routes/Inventory/CategoryPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryPage = () => {
  const [items, setItems] = useState([]);
  
  // ❌ API 邏輯混在元件內
  useEffect(() => {
    axios.get('/api/inventory/categories')
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);
  
  // ❌ 靜態資料混在元件內
  const categoryLabels = {
    vegetable: '蔬果類',
    meat: '肉類',
    dairy: '乳製品'
  };
  
  // ❌ 格式化邏輯混在元件內
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-TW');
  };
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{categoryLabels[item.category]}</h3>
          <p>{formatDate(item.expiryDate)}</p>
        </div>
      ))}
    </div>
  );
};
```

###### ✅ 優化後：關注點分離

**1. 常數分離**

```ts
// src/features/inventory/constants/categoryLabels.ts
export const CATEGORY_LABELS = {
  vegetable: '蔬果類',
  meat: '肉類',
  dairy: '乳製品'
} as const;
```

**2. 工具函式分離**

```ts
// src/shared/utils/format/dateFormat.ts
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-TW');
};
```

**3. API 服務分離**

```ts
// src/features/inventory/services/inventoryService.ts
import { apiClient } from '@/lib/axios';
import { InventoryItem } from '../types/inventory.types';

export const inventoryService = {
  getCategories: async (): Promise<InventoryItem[]> => {
    const { data } = await apiClient.get('/inventory/categories');
    return data;
  }
};
```

**4. 自訂 Hook 分離**

```ts
// src/features/inventory/hooks/useInventory.ts
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: inventoryService.getCategories
  });
};
```

**5. 元件簡化**

```tsx
// src/features/inventory/components/CategoryList.tsx
import { useInventory } from '../hooks/useInventory';
import { CATEGORY_LABELS } from '../constants/categoryLabels';
import { formatDate } from '@/shared/utils/format/dateFormat';

export const CategoryList = () => {
  const { data: items, isLoading } = useInventory();
  
  if (isLoading) return <div>載入中...</div>;
  
  return (
    <div>
      {items?.map(item => (
        <div key={item.id}>
          <h3>{CATEGORY_LABELS[item.category]}</h3>
          <p>{formatDate(item.expiryDate)}</p>
        </div>
      ))}
    </div>
  );
};
```

#### 📋 資料分離檢查清單

針對每個元件，檢查是否可分離：

- [ ] **靜態文本資料**
  - 分類標籤、選項列表、預設值
  - → 移至 `constants/` 資料夾

- [ ] **格式化函式**
  - 日期格式化、數字格式化、字串處理
  - → 移至 `shared/utils/format/` 資料夾

- [ ] **驗證函式**
  - 表單驗證、資料驗證邏輯
  - → 移至 `shared/utils/validation/` 資料夾

- [ ] **API 請求邏輯**
  - axios 呼叫、資料轉換
  - → 移至 `features/[feature]/services/` 資料夾

- [ ] **狀態管理邏輯**
  - useState、useEffect 複雜邏輯
  - → 移至 `features/[feature]/hooks/` 資料夾

- [ ] **業務邏輯**
  - 複雜運算、決策邏輯
  - → 移至 `features/[feature]/hooks/` 或 `services/` 資料夾

---

## 遷移步驟建議

### 階段 1：建立新架構（不影響現有功能）

> **目標**：建立新資料夾結構，不破壞現有程式碼

1. **建立新資料夾結構**
   ```bash
   mkdir -p src/features
   mkdir -p src/shared/{components,hooks,utils,constants,types}
   mkdir -p src/app
   ```

2. **設定路徑別名**（減少遷移後的 import 路徑修改）
   
   ```ts
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@/features/*": ["src/features/*"],
         "@/shared/*": ["src/shared/*"],
         "@/lib/*": ["src/lib/*"]
       }
     }
   }
   ```

   ```ts
   // vite.config.ts
   import path from 'path';
   
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
         '@/features': path.resolve(__dirname, './src/features'),
         '@/shared': path.resolve(__dirname, './src/shared'),
         '@/lib': path.resolve(__dirname, './src/lib')
       }
     }
   });
   ```

### 階段 2：逐步遷移功能模組

> **策略**：從小功能開始，逐步遷移，每次遷移一個功能模組

#### 範例：遷移 Inventory 功能

1. **建立功能模組資料夾**
   ```bash
   mkdir -p src/features/inventory/{components,services,hooks,store,types,constants}
   ```

2. **移動元件**
   ```bash
   # 移動庫存相關元件
   mv src/components/ui/InventoryCard.tsx src/features/inventory/components/
   mv src/components/ui/CategoryCard.tsx src/features/inventory/components/
   mv src/components/ui/FoodCard.tsx src/features/inventory/components/
   mv src/components/layout/inventory/* src/features/inventory/components/
   ```

3. **移動 API 服務**
   ```bash
   mv src/api/inventory.ts src/features/inventory/services/inventoryService.ts
   ```

4. **移動資料常數**
   ```bash
   mv src/data/categories.ts src/features/inventory/constants/
   mv src/data/foodIImg.ts src/features/inventory/constants/foodImages.ts
   ```

5. **修正 import 路徑**
   ```tsx
   // 修改前
   import { InventoryCard } from '@/components/ui/InventoryCard';
   import { getInventory } from '@/api/inventory';
   
   // 修改後
   import { InventoryCard } from '@/features/inventory/components/InventoryCard';
   import { inventoryService } from '@/features/inventory/services/inventoryService';
   ```

6. **測試功能正常**
   - 啟動開發伺服器 `npm run dev`
   - 測試庫存頁面功能是否正常

### 階段 3：共用元件遷移

1. **建立新的共用元件資料夾結構**
   ```bash
   mkdir -p src/shared/components/{ui,common,layout,feedback}
   ```

2. **分類並移動 UI 元件**
   
   **a. shadcn/ui 原始元件**（全小寫檔名）
   ```bash
   # 移動 shadcn/ui 原始元件到 shared/components/ui/
   mv src/components/ui/button.tsx src/shared/components/ui/
   mv src/components/ui/card.tsx src/shared/components/ui/
   mv src/components/ui/input.tsx src/shared/components/ui/
   mv src/components/ui/tabs.tsx src/shared/components/ui/
   mv src/components/ui/sheet.tsx src/shared/components/ui/
   mv src/components/ui/dropdown-menu.tsx src/shared/components/ui/
   mv src/components/ui/nav-tabs.tsx src/shared/components/ui/
   ```
   
   **b. 客製化共用元件**（PascalCase 檔名）
   
   先判斷哪些元件是跨功能共用的：
   - `MemberAvatar.tsx` → `shared/components/common/` （多處使用）
   - `SearchModal.tsx`, `FilterModal.tsx` → 視使用範圍決定
   
   ```bash
   # 移動跨功能共用的客製化元件
   mv src/components/ui/MemberAvatar.tsx src/shared/components/common/
   # 如果 SearchModal 和 FilterModal 是通用的
   mv src/components/ui/SearchModal.tsx src/shared/components/common/
   mv src/components/ui/FilterModal.tsx src/shared/components/common/
   ```
   
   **c. 功能專屬元件**（移至對應功能模組）
   
   這些元件應該移到各自的功能模組：
   ```bash
   # 庫存相關元件
   mv src/components/ui/InventoryCard.tsx src/features/inventory/components/
   mv src/components/ui/CategoryCard.tsx src/features/inventory/components/
   mv src/components/ui/FoodCard.tsx src/features/inventory/components/
   mv src/components/ui/CommonItemCard.tsx src/features/inventory/components/
   mv src/components/ui/InventoryMainTabs.tsx src/features/inventory/components/
   mv src/components/ui/InventorySubTabs.tsx src/features/inventory/components/
   mv src/components/ui/FoodDetailModal.tsx src/features/inventory/components/
   
   # 食譜相關元件
   mv src/components/ui/RecipeCard.tsx src/features/recipe/components/
   mv src/components/ui/AiRecommendCard.tsx src/features/recipe/components/
   ```

3. **移動版面元件**
   ```bash
   mv src/components/layout/TopNav.tsx src/shared/components/layout/
   mv src/components/layout/BottomNav.tsx src/shared/components/layout/
   mv src/components/layout/HeroCard.tsx src/shared/components/layout/
   ```

4. **移動回饋元件**
   ```bash
   mv src/components/feedback/SWPrompt.tsx src/shared/components/feedback/
   ```

5. **更新 import 路徑**
   ```tsx
   // 修改前
   import { Button } from '@/components/ui/button';
   import { Card } from '@/components/ui/card';
   import { InventoryCard } from '@/components/ui/InventoryCard';
   
   // 修改後
   import { Button } from '@/shared/components/ui/button';  // shadcn 原始元件
   import { Card } from '@/shared/components/ui/card';      // shadcn 原始元件
   import { InventoryCard } from '@/features/inventory/components/InventoryCard';  // 功能專屬元件
   ```


### 階段 4：清理舊資料夾

1. **確認所有檔案已遷移**
   ```bash
   # 檢查舊資料夾是否為空
   ls -la src/components
   ls -la src/api
   ls -la src/data
   ```

2. **刪除空資料夾**
   ```bash
   rm -rf src/components/layout/inventory
   # 只刪除確定已遷移且為空的資料夾
   ```

### 階段 5：建立 Next.js 相容結構（選擇性）

> **時機**：確定要遷移至 Next.js 時再執行

1. **建立 pages 資料夾**
   ```bash
   mkdir -p src/pages
   mkdir -p src/pages/{inventory,recipe,food-scan,settings}
   ```

2. **建立路由檔案**
   ```bash
   # 根目錄頁面
   touch src/pages/_app.tsx
   touch src/pages/_document.tsx
   touch src/pages/index.tsx
   touch src/pages/login.tsx
   touch src/pages/register.tsx
   
   # 功能頁面
   touch src/pages/inventory/index.tsx
   touch src/pages/inventory/[categoryId].tsx
   touch src/pages/recipe/index.tsx
   touch src/pages/settings/{index,profile,notifications,subscription}.tsx
   ```

3. **建立自訂 _app.tsx（全域設定）**
   ```tsx
   // src/pages/_app.tsx
   import type { AppProps } from 'next/app';
   import { Provider } from 'react-redux';
   import { QueryClientProvider } from '@tanstack/react-query';
   import { store } from '@/lib/redux/store';
   import { queryClient } from '@/lib/reactQuery';
   import '@/styles/globals.css';
   
   export default function App({ Component, pageProps }: AppProps) {
     return (
       <Provider store={store}>
         <QueryClientProvider client={queryClient}>
           <Component {...pageProps} />
         </QueryClientProvider>
       </Provider>
     );
   }
   ```

4. **建立自訂 _document.tsx（HTML 結構）**
   ```tsx
   // src/pages/_document.tsx
   import { Html, Head, Main, NextScript } from 'next/document';
   
   export default function Document() {
     return (
       <Html lang="zh-TW">
         <Head />
         <body>
           <Main />
           <NextScript />
         </body>
       </Html>
     );
   }
   ```

5. **頁面元件引用功能模組**
   ```tsx
   // src/pages/inventory/index.tsx
   import { CategoryList } from '@/features/inventory/components/CategoryList';
   import { InventorySection } from '@/features/inventory/components/InventorySection';
   import { TopNav } from '@/shared/components/layout/TopNav';
   import { BottomNav } from '@/shared/components/layout/BottomNav';
   
   export default function InventoryPage() {
     return (
       <>
         <TopNav />
         <main>
           <h1>庫存管理</h1>
           <CategoryList />
           <InventorySection />
         </main>
         <BottomNav />
       </>
     );
   }
   ```

6. **動態路由範例**
   ```tsx
   // src/pages/inventory/[categoryId].tsx
   import { useRouter } from 'next/router';
   import { CategoryDetail } from '@/features/inventory/components/CategoryDetail';
   import type { GetServerSideProps } from 'next';
   
   interface CategoryPageProps {
     categoryId: string;
   }
   
   export default function CategoryPage({ categoryId }: CategoryPageProps) {
     return <CategoryDetail categoryId={categoryId} />;
   }
   
   export const getServerSideProps: GetServerSideProps = async (context) => {
     const { categoryId } = context.params!;
     
     return {
       props: {
         categoryId,
       },
     };
   };
   ```

---

## 驗證檢查清單

### 架構驗證

- [ ] 所有功能模組遵循統一結構（`components`, `services`, `hooks`, `types`, `constants`）
- [ ] 共用元件與功能專屬元件明確分離
- [ ] 路徑別名設定正確且運作正常
- [ ] 無跨功能模組直接引用（只能引用 `shared/`）

### 命名驗證

- [ ] 資料夾命名遵循 kebab-case（功能模組）或 PascalCase（元件）
- [ ] 檔案命名遵循規範（元件 PascalCase、hooks useXxx、services xxxService）
- [ ] 同性質檔案用資料夾分類，而非檔名描述

### 資料分離驗證

- [ ] 靜態資料移至 `constants/` 資料夾
- [ ] API 邏輯移至 `services/` 資料夾
- [ ] 工具函式移至 `shared/utils/` 資料夾
- [ ] 元件內無 API 請求、複雜計算邏輯

### 功能驗證

- [ ] 開發伺服器正常啟動 `npm run dev`
- [ ] 所有頁面路由正常運作
- [ ] 無 TypeScript 錯誤
- [ ] 無 ESLint 錯誤
- [ ] 所有功能測試通過

### Next.js 相容性驗證

- [ ] `features/` 模組無依賴 React Router 特定邏輯
- [ ] 元件無使用 client-side only API（如 localStorage）於初始渲染
- [ ] 預留 `pages/` 資料夾結構（如計畫遷移至 Next.js Pages Router）

---

## 附錄

### A. 常見問題

#### Q1: 如何決定元件應該放在 `shared/` 還是 `features/[feature]/`？

**判斷標準**：
- 如果元件在 **兩個以上功能** 中使用 → `shared/components/`
- 如果元件只在 **單一功能** 中使用 → `features/[feature]/components/`
- 基礎 UI 元件（Button、Card、Input）→ `shared/components/ui/`

#### Q2: `utils` 與 `helpers` 有什麼差別？

**建議區分**：
- **`utils/`**: 獨立的工具函式（格式化、驗證、轉換）
  - `utils/format/dateFormat.ts`
  - `utils/validation/validators.ts`
- **`helpers/`**: 輔助性、組合性函式（需要多個工具函式協作）
  - `helpers/dataProcessing.ts`

#### Q3: API 回應資料的轉換應該放在哪裡？

**建議**：
- 簡單轉換（如 camelCase ↔ snake_case）→ `services/` 內處理
- 複雜轉換（如資料聚合、計算）→ 建立 `adapters/` 或 `transformers/` 資料夾

```ts
// src/features/inventory/services/inventoryService.ts
import { inventoryAdapter } from '../adapters/inventoryAdapter';

export const inventoryService = {
  getCategories: async () => {
    const { data } = await apiClient.get('/inventory/categories');
    return inventoryAdapter.toClient(data); // 轉換 API 資料格式
  }
};
```

#### Q4: Redux store 應該如何組織？

**建議**：
- 功能專屬的 slice → `features/[feature]/store/[feature]Slice.ts`
- 全域狀態（如使用者資訊、主題）→ `lib/redux/slices/`

```ts
// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import inventoryReducer from '@/features/inventory/store/inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer
  }
});
```

### B. 參考資源

- [Next.js Pages Router 文件](https://nextjs.org/docs/pages)
- [Feature-Sliced Design 架構](https://feature-sliced.design/)
- [React 專案結構最佳實踐](https://www.joshwcomeau.com/react/file-structure/)
- [TypeScript 專案規範](https://google.github.io/styleguide/tsguide.html)

---

**文件版本**: v1.0  
**最後更新**: 2025-11-26  
**維護者**: FuFood 開發團隊
