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
  ApiSuccess,
  InventoryCategoriesResponse,
  InventoryStatsResponse,
  InventorySummaryResponse,
  InventorySettingsResponse,
  BatchOperationResponse,
  FrequentItemsResponse,
  ExpiredItemsResponse,
  UpdateInventorySettingsRequest,
} from '../types';

export type InventoryApi = {
  // 取得庫存列表 (Renamed from getItems)
  getInventory: (params?: GetInventoryRequest) => Promise<GetInventoryResponse>;

  // 取得單一食材
  getItem: (id: string) => Promise<ApiSuccess<{ item: FoodItem }>>;

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
  batchAdd: (data: BatchAddInventoryRequest) => Promise<BatchOperationResponse>;

  // 批次更新
  batchUpdate: (
    data: BatchUpdateInventoryRequest,
  ) => Promise<BatchOperationResponse>;

  // 批次刪除
  batchDelete: (
    data: BatchDeleteInventoryRequest,
  ) => Promise<BatchOperationResponse>;

  // 取得常用項目 (New)
  getFrequentItems: (limit?: number) => Promise<FrequentItemsResponse>;

  // 取得過期紀錄 (New)
  getExpiredItems: (
    page?: number,
    limit?: number,
  ) => Promise<ExpiredItemsResponse>;

  // 取得統計資料
  getStats: (groupId?: string) => Promise<InventoryStatsResponse>;

  // 取得庫存概況
  getSummary: () => Promise<InventorySummaryResponse>;

  // 取得分類資訊
  getCategories: () => Promise<InventoryCategoriesResponse>;

  // 取得庫存設定
  getSettings: () => Promise<InventorySettingsResponse>;

  // 更新庫存設定
  updateSettings: (
    data: UpdateInventorySettingsRequest,
  ) => Promise<InventorySettingsResponse>;
};
