# Inventory Module 優化規劃

> **建立日期**: 2025-12-01  
> **目標**: 將 Inventory 模組重構為與 Auth、Groups、Food-Scan 模組相同的架構標準

---

## 📊 現況分析

### 現有結構
```
inventory/
├── README.md (簡易版)
├── components/
│   ├── layout/     # 5 個 layout 元件
│   └── ui/         # 12 個 UI 元件
├── constants/
│   ├── categories.ts
│   └── foods.ts
├── hooks/          # (空目錄)
├── services/       # inventoryService.ts (空檔案)
├── store/          # inventorySlice.ts (空檔案)
└── types/          # (空目錄)
```

### 問題點識別

#### 🔴 嚴重問題
1. **缺少 API 層**: 沒有完整的 API 實作與介面定義
2. **缺少型別定義**: `types/` 目錄為空，缺乏 TypeScript 型別系統
3. **缺少 Hooks**: `hooks/` 目錄為空，邏輯未抽離
4. **Store 未實作**: Redux slice 為空檔案
5. **Service 未實作**: Service 層為空檔案

#### 🟡 中等問題
1. **Mock 資料硬編碼**: 資料直接寫在 `constants/foods.ts`
2. **元件未分類**: UI 元件缺乏明確的功能分類
3. **文件不完整**: README 缺少詳細的 API 規格與型別說明

#### 🟢 良好之處
1. ✅ 元件結構已建立 (layout / ui 分離)
2. ✅ 有基本的常數定義
3. ✅ 元件命名清晰

---

## 🎯 優化目標

### 對齊標準 (參考 Auth / Groups / Food-Scan)

1. **完整的 API 層**
   - API 介面定義
   - 真實 API 實作
   - Mock API 實作
   - 環境變數控制 Mock 模式

2. **完整的型別系統**
   - 定義所有資料型別
   - API 請求/回應型別
   - 元件 Props 型別

3. **Hooks 抽離**
   - 庫存管理 Hook (`useInventory`)
   - 篩選邏輯 Hook (`useInventoryFilter`)
   - 過期檢查 Hook (`useExpiryCheck`)

4. **Redux Store**
   - State 定義
   - Actions / Reducers
   - Selectors

5. **詳細文件**
   - 完整 README
   - API 規格
   - 型別定義
   - 使用範例

---

## 📝 詳細優化計畫

### Phase 1: 型別定義 (types/)

#### 建立檔案
```
types/
├── index.ts                  # 統一匯出
├── inventory.types.ts        # 主要型別
├── api.types.ts             # API 型別
└── filter.types.ts          # 篩選型別
```

#### 型別清單

**inventory.types.ts**
```typescript
// 食材項目
export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  imageUrl?: string;
  purchaseDate: string;     // YYYY-MM-DD
  expiryDate: string;       // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes?: string;
  groupId?: string;         // 所屬群組
  createdAt: string;
  updatedAt?: string;
};

// 食材分類
export type FoodCategory = 
  | '蔬果類'
  | '冷凍調理類'
  | '主食烘焙類'
  | '乳製品飲料類'
  | '冷凍海鮮類'
  | '肉品類'
  | '其他';

// 單位
export type FoodUnit = 
  | '個' | '包' | '瓶' | '罐' | '盒' | '顆' | '根' | '把' | '條' | '桶' | '片'
  | 'kg' | 'g' | 'L' | 'ml';

// 分類資訊
export type CategoryInfo = {
  id: string;
  title: string;
  count: number;
  imageUrl: string;
  bgColor: string;
  slogan: string;
  description: string[];
};

// 庫存狀態
export type InventoryStatus = 'normal' | 'low-stock' | 'expired' | 'expiring-soon';

// 庫存統計
export type InventoryStats = {
  totalItems: number;
  expiredCount: number;
  expiringSoonCount: number;    // 3天內過期
  lowStockCount: number;
  byCategory: Record<FoodCategory, number>;
};
```

**api.types.ts**
```typescript
// 取得庫存請求
export type GetInventoryRequest = {
  groupId?: string;
  category?: FoodCategory;
  status?: InventoryStatus;
  page?: number;
  limit?: number;
};

// 取得庫存回應
export type GetInventoryResponse = {
  items: FoodItem[];
  total: number;
  stats: InventoryStats;
};

// 新增食材請求
export type AddFoodItemRequest = Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>;

// 新增食材回應
export type AddFoodItemResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
};

// 更新食材請求
export type UpdateFoodItemRequest = Partial<Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>>;

// 更新食材回應
export type UpdateFoodItemResponse = {
  success: boolean;
  message: string;
};

// 刪除食材回應
export type DeleteFoodItemResponse = {
  success: boolean;
  message: string;
};

// 批次操作請求
export type BatchOperationRequest = {
  itemIds: string[];
  operation: 'delete' | 'update-category' | 'update-status';
  data?: Record<string, any>;
};
```

**filter.types.ts**
```typescript
export type FilterOptions = {
  category?: FoodCategory | 'all';
  status?: InventoryStatus | 'all';
  searchQuery?: string;
  sortBy?: 'name' | 'expiryDate' | 'quantity' | 'addedAt';
  sortOrder?: 'asc' | 'desc';
};

export type Tab = 'all' | 'expired' | 'expiring-soon' | 'low-stock' | 'common-items';
```

---

### Phase 2: API 層 (api/)

#### 建立檔案
```
api/
├── index.ts                    # 統一匯出
├── inventoryApi.ts            # API 介面定義
├── inventoryRealApi.ts        # 真實 API 實作
└── mock/
    ├── inventoryMockApi.ts    # Mock API 實作
    └── inventoryMockData.ts   # Mock 資料
```

#### API 介面 (inventoryApi.ts)

```typescript
export type InventoryApi = {
  // 取得庫存列表
  getItems: (params?: GetInventoryRequest) => Promise<GetInventoryResponse>;
  
  // 取得單一食材
  getItem: (id: string) => Promise<FoodItem>;
  
  // 新增食材
  addItem: (data: AddFoodItemRequest) => Promise<AddFoodItemResponse>;
  
  // 更新食材
  updateItem: (id: string, data: UpdateFoodItemRequest) => Promise<UpdateFoodItemResponse>;
  
  // 刪除食材
  deleteItem: (id: string) => Promise<DeleteFoodItemResponse>;
  
  // 批次操作
  batchOperation: (data: BatchOperationRequest) => Promise<{ success: boolean }>;
  
  // 取得統計資料
  getStats: (groupId?: string) => Promise<InventoryStats>;
  
  // 取得分類資訊
  getCategories: () => Promise<CategoryInfo[]>;
};
```

#### API 端點規劃

| 方法 | 端點 | 說明 |
|-----|------|------|
| GET | `/api/inventory` | 取得庫存列表 |
| GET | `/api/inventory/:id` | 取得單一食材 |
| POST | `/api/inventory` | 新增食材 |
| PUT | `/api/inventory/:id` | 更新食材 |
| DELETE | `/api/inventory/:id` | 刪除食材 |
| POST | `/api/inventory/batch` | 批次操作 |
| GET | `/api/inventory/stats` | 取得統計 |
| GET | `/api/inventory/categories` | 取得分類 |

---

### Phase 3: Hooks (hooks/)

#### 建立檔案
```
hooks/
├── index.ts
├── useInventory.ts           # 主要庫存 Hook
├── useInventoryFilter.ts     # 篩選 Hook
├── useInventoryStats.ts      # 統計 Hook
└── useExpiryCheck.ts         # 過期檢查 Hook
```

#### Hook 規格

**useInventory.ts**
```typescript
const useInventory = (groupId?: string) => {
  return {
    items: FoodItem[];
    isLoading: boolean;
    error: Error | null;
    addItem: (data: AddFoodItemRequest) => Promise<void>;
    updateItem: (id: string, data: UpdateFoodItemRequest) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    batchDelete: (ids: string[]) => Promise<void>;
    refetch: () => Promise<void>;
  };
};
```

**useInventoryFilter.ts**
```typescript
const useInventoryFilter = (items: FoodItem[]) => {
  return {
    filteredItems: FoodItem[];
    filters: FilterOptions;
    setFilter: (key: keyof FilterOptions, value: any) => void;
    clearFilters: () => void;
    // 預設篩選器
    byCategory: (category: FoodCategory) => FoodItem[];
    byStatus: (status: InventoryStatus) => FoodItem[];
    bySearch: (query: string) => FoodItem[];
  };
};
```

**useInventoryStats.ts**
```typescript
const useInventoryStats = (items: FoodItem[]) => {
  return {
    stats: InventoryStats;
    refreshStats: () => void;
  };
};
```

**useExpiryCheck.ts**
```typescript
const useExpiryCheck = (item: FoodItem) => {
  return {
    isExpired: boolean;
    isExpiringSoon: boolean;     // 3天內
    daysUntilExpiry: number;
    expiryStatus: InventoryStatus;
  };
};
```

---

### Phase 4: Services (services/)

#### 建立檔案
```
services/
├── index.ts
└── inventoryService.ts       # API 包裝層
```

#### Service 職責

```typescript
// inventoryService.ts
export const inventoryService = {
  // 包裝 API 呼叫
  getInventory: async (params?: GetInventoryRequest) => {
    const response = await inventoryApi.getItems(params);
    // 可加入額外邏輯 (快取、轉換等)
    return response;
  },
  
  // 本地計算邏輯
  calculateExpiryStatus: (expiryDate: string): InventoryStatus => { ... },
  
  // 排序邏輯
  sortItems: (items: FoodItem[], sortBy: string, order: string) => { ... },
  
  // 資料轉換
  transformApiData: (apiData: any): FoodItem => { ... },
};
```

---

### Phase 5: Redux Store (store/)

#### 建立檔案
```
store/
├── index.ts
└── inventorySlice.ts
```

#### Slice 結構

```typescript
type InventoryState = {
  items: FoodItem[];
  selectedItem: FoodItem | null;
  filters: FilterOptions;
  stats: InventoryStats | null;
  isLoading: boolean;
  error: string | null;
};

// Actions
- setItems
- addItem
- updateItem
- removeItem
- setSelectedItem
- setFilters
- setStats
- setLoading
- setError

// Selectors
- selectAllItems
- selectItemsByCategory
- selectExpiredItems
- selectExpiringSoonItems
- selectLowStockItems
- selectItemById
- selectStats
```

---

### Phase 6: 元件重構 (components/)

#### 調整結構
```
components/
├── features/              # 功能性元件
│   ├── InventoryList.tsx
│   ├── InventoryGrid.tsx
│   ├── FilterPanel.tsx
│   └── StatsOverview.tsx
├── modals/                # Modal 元件
│   ├── FoodDetailModal.tsx
│   ├── FilterModal.tsx
│   └── SearchModal.tsx
└── ui/                    # 基礎 UI 元件
    ├── FoodCard.tsx
    ├── CategoryCard.tsx
    ├── CommonItemCard.tsx
    ├── MemberAvatar.tsx
    ├── HeroSection.tsx
    └── CategoryBanner.tsx
```

#### 元件優化建議

1. **分離關注點**
   - Layout → features (包含邏輯)
   - UI → ui (純展示)
   - Modal 獨立資料夾

2. **Props 型別化**
   - 所有元件都要有明確的 Props 型別
   - 使用 types/ 中定義的型別

3. **整合 Hooks**
   - 使用 `useInventory` 獲取資料
   - 使用 `useInventoryFilter` 處理篩選

---

### Phase 7: 常數遷移 (constants/)

#### 調整檔案
```
constants/
├── index.ts
├── categories.ts         # 保留，改為 CategoryInfo[]
├── foodUnits.ts          # 新增：單位選項
├── filterOptions.ts      # 新增：篩選選項
└── config.ts             # 新增：模組配置
```

#### 資料遷移

```typescript
// categories.ts - 改為函式返回
export const getCategoryInfo = (): CategoryInfo[] => [ ... ];

// Mock 資料移至 api/mock/inventoryMockData.ts
export const MOCK_FOOD_ITEMS: FoodItem[] = [ ... ];
```

---

### Phase 8: README 文件

#### 文件結構 (與其他模組一致)

```markdown
# Inventory Module

## 📋 目錄
- 概述
- 目錄結構
- 核心功能
- 型別定義
- API 規格
- 元件說明
- Hooks 詳解
- Services 服務層
- Redux Store
- 環境變數設定

## 詳細內容
- 所有 API 端點的請求/回應範例
- 完整的型別定義
- Hooks 使用範例
- 元件 Props 說明
- Mock 資料說明
```

---

## 🗓️ 實施優先順序

### 階段 1: 基礎建設 (必須)
1. ✅ 建立型別定義 (`types/`)
2. ✅ 建立 API 層 (`api/`)
3. ✅ 實作 Mock API

### 階段 2: 邏輯抽離 (必須)
4. ✅ 建立 Hooks (`hooks/`)
5. ✅ 實作 Redux Store

### 階段 3: 服務層 (建議)
6. ✅ 實作 Services

### 階段 4: 元件優化 (建議)
7. 🔄 重構元件結構
8. 🔄 元件型別化

### 階段 5: 文件完善 (必須)
9. ✅ 撰寫完整 README

---

## 📊 成功指標

### 技術指標
- [ ] 所有型別都有明確定義
- [ ] API 層完整實作 (含 Mock)
- [ ] Hooks 測試覆蓋率 > 80%
- [ ] Redux Store 正常運作
- [ ] 元件 Props 100% 型別化

### 文件指標
- [ ] README 包含所有 API 規格
- [ ] 每個 Hook 都有使用範例
- [ ] 每個 API 都有請求/回應範例

### 一致性指標
- [ ] 與 Auth 模組結構一致
- [ ] 與 Groups 模組結構一致
- [ ] 與 Food-Scan 模組結構一致

---

## 🚀 預期效益

### 開發體驗
1. **型別安全**: TypeScript 型別系統防止錯誤
2. **邏輯複用**: Hooks 可在多處使用
3. **易於測試**: 清晰的層次結構
4. **快速開發**: Mock 模式支援離線開發

### 維護性
1. **結構清晰**: 職責分明，易於理解
2. **文件完整**: 降低學習成本
3. **標準一致**: 與其他模組對齊

### 擴展性
1. **易於新增功能**: 清晰的架構
2. **API 切換簡單**: 環境變數控制
3. **支援未來需求**: 完整的型別系統

---

## 📝 注意事項

### 相容性
- 現有元件需要逐步遷移，避免一次性破壞
- 保留現有 constants 檔案，逐步遷移資料

### 資料遷移
- `constants/foods.ts` → `api/mock/inventoryMockData.ts`
- 保持資料格式相容

### 測試
- 為所有 Hooks 撰寫單元測試
- API Mock 確保與真實 API 行為一致

---

## 🔗 參考資源

### 現有模組
- `src/modules/auth/` - 認證模組參考
- `src/modules/groups/` - 群組模組參考
- `src/modules/food-scan/` - 掃描模組參考

### 相關檔案
- `src/modules/food-scan/types/foodItem.ts` - FoodItem 型別可參考
- `src/modules/groups/api/groupsApi.ts` - API 模式參考
- `src/modules/auth/hooks/useAuth.ts` - Hook 模式參考

---

**文件版本**: v1.0  
**最後更新**: 2025-12-01  
**負責人**: Development Team
