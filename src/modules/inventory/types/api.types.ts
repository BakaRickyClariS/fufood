import type { FoodItem, FoodCategory, InventoryStatus, InventoryStats, CategoryInfo } from './inventory.types';

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
