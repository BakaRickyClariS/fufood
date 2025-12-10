import type {
  FoodItem,
  FoodCategory,
  InventoryStatus,
  InventoryStats,
  CategoryInfo,
} from './inventory.types';

// 通用成功封裝
export type ApiSuccess<T> = {
  status: true;
  message?: string;
  data: T;
};

// 取得庫存請求
export type GetInventoryRequest = {
  groupId?: string;
  category?: FoodCategory;
  status?: InventoryStatus;
  include?: string; // e.g., "summary,stats"
  page?: number;
  limit?: number;
};

// 取得庫存回應
export type GetInventoryResponse = ApiSuccess<{
  items: FoodItem[];
  total: number;
  stats?: InventoryStats;
  summary?: InventorySummary;
}>;

// 新增食材請求
export type AddFoodItemRequest = Omit<
  FoodItem,
  'id' | 'createdAt' | 'updatedAt'
>;

// 新增食材回應
export type AddFoodItemResponse = ApiSuccess<{
  id: string;
}>;

// 更新食材請求
export type UpdateFoodItemRequest = Partial<
  Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
>;

// 更新食材回應
export type UpdateFoodItemResponse = ApiSuccess<{
  id: string;
}>;

// 刪除食材回應
export type DeleteFoodItemResponse = ApiSuccess<Record<string, never>>;

// 批次操作請求
export type BatchAddInventoryRequest = {
  items: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>[];
};

export type BatchUpdateInventoryRequest = {
  items: Partial<FoodItem>[];
};

export type BatchDeleteInventoryRequest = {
  ids: string[];
};

export type BatchOperationResponse = ApiSuccess<Record<string, never>>;

// 庫存設定
export type InventorySettings = {
  lowStockThreshold: number;
  expiringSoonDays: number;
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
  layoutType?: 'layout-a' | 'layout-b' | 'layout-c';
  categoryOrder?: string[]; // 儲存類別 ID 的順序陣列
};

export type UpdateInventorySettingsRequest = Partial<InventorySettings>;

export type InventorySummary = {
  total: number;
  expiring: number;
  expired: number;
  lowStock: number;
};

export type InventoryStatsResponse = ApiSuccess<{ stats: InventoryStats }>;
export type InventoryCategoriesResponse = ApiSuccess<{
  categories: CategoryInfo[];
}>;
export type InventorySummaryResponse = ApiSuccess<{
  summary: InventorySummary;
}>;
export type InventorySettingsResponse = ApiSuccess<{
  settings: InventorySettings;
}>;
