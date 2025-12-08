import type {
  GetInventoryRequest,
  GetInventoryResponse,
  AddFoodItemRequest,
  AddFoodItemResponse,
  UpdateFoodItemRequest,
  UpdateFoodItemResponse,
  DeleteFoodItemResponse,

  BatchAddInventoryRequest,
  BatchUpdateInventoryRequest,
  BatchDeleteInventoryRequest,
  FoodItem,
  CategoryInfo,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest,
} from '../types';

export type InventoryApi = {
  // 取得庫存列表 (Renamed from getItems)
  getInventory: (params?: GetInventoryRequest) => Promise<GetInventoryResponse>;

  // 取得單一食材
  getItem: (id: string) => Promise<FoodItem>;

  // 新增食材
  addItem: (data: AddFoodItemRequest) => Promise<AddFoodItemResponse>;

  // 更新食材
  updateItem: (
    id: string,
    data: UpdateFoodItemRequest,
  ) => Promise<UpdateFoodItemResponse>;

  // 刪除食材
  deleteItem: (id: string) => Promise<DeleteFoodItemResponse>;

  // 批次新增
  batchAdd: (
    data: BatchAddInventoryRequest,
  ) => Promise<{ success: boolean; message?: string }>;

  // 批次更新
  batchUpdate: (
    data: BatchUpdateInventoryRequest,
  ) => Promise<{ success: boolean; message?: string }>;

  // 批次刪除
  batchDelete: (
    data: BatchDeleteInventoryRequest,
  ) => Promise<{ success: boolean; message?: string }>;

  // 取得常用項目 (New)
  getFrequentItems: (limit?: number) => Promise<FoodItem[]>;

  // 取得過期紀錄 (New)
  getExpiredItems: (
    page?: number,
    limit?: number,
  ) => Promise<{ items: FoodItem[]; total: number }>;

  // 取得統計資料
  getStats: (groupId?: string) => Promise<InventoryStats>;

  // 取得庫存概況
  getSummary: () => Promise<InventorySummary>;

  // 取得分類資訊
  getCategories: () => Promise<CategoryInfo[]>;

  // 取得庫存設定
  getSettings: () => Promise<InventorySettings>;

  // 更新庫存設定
  updateSettings: (data: UpdateInventorySettingsRequest) => Promise<void>;
};
