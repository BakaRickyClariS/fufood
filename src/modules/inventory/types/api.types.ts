import type {
  FoodItem,
  FoodCategory,
  InventoryStatus,
  InventoryStats,
} from './inventory.types';

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
export type AddFoodItemRequest = Omit<
  FoodItem,
  'id' | 'createdAt' | 'updatedAt'
>;

// 新增食材回應
export type AddFoodItemResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
};

// 更新食材請求
export type UpdateFoodItemRequest = Partial<
  Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
>;

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
export type BatchAddInventoryRequest = {
  items: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>[];
};

export type BatchUpdateInventoryRequest = {
  items: Partial<FoodItem>[];
};

export type BatchDeleteInventoryRequest = {
  ids: string[];
};

// 庫存設定
export type InventorySettings = {
  lowStockThreshold: number;
  expiringSoonDays: number;
  notifyOnExpiry: boolean;
  notifyOnLowStock: boolean;
};

export type UpdateInventorySettingsRequest = Partial<InventorySettings>;

export type InventorySummary = {
  total: number;
  expiring: number;
  expired: number;
  lowStock: number;
};

export type BatchOperationRequest = {
  operation: 'delete' | 'update-category' | 'add' | 'update';
  itemIds: string[];
  data?: any;
};
