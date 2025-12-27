import type {
  GetInventoryRequest,
  GetInventoryResponse,
  AddFoodItemRequest,
  AddFoodItemResponse,
  UpdateFoodItemRequest,
  UpdateFoodItemResponse,
  DeleteFoodItemResponse,
  BatchDeleteInventoryRequest,
  FoodItem,
  ApiSuccess,
  InventoryCategoriesResponse,
  InventorySummaryResponse,
  InventorySettingsResponse,
  UpdateInventorySettingsRequest,
} from '../types';

export type InventoryApi = {
  // 取得庫存列表（支援 status/include）
  getInventory: (params?: GetInventoryRequest) => Promise<GetInventoryResponse>;

  // 取得單筆食材
  getItem: (
    id: string,
    refrigeratorId?: string,
  ) => Promise<ApiSuccess<{ item: FoodItem }>>;

  // 新增食材
  addItem: (
    data: AddFoodItemRequest,
    refrigeratorId?: string,
  ) => Promise<AddFoodItemResponse>;

  // 更新食材
  updateItem: (
    id: string,
    data: UpdateFoodItemRequest,
    refrigeratorId?: string,
  ) => Promise<UpdateFoodItemResponse>;

  // 刪除食材
  deleteItem: (
    id: string,
    refrigeratorId?: string,
  ) => Promise<DeleteFoodItemResponse>;

  // 批次刪除（可選）
  batchDelete: (
    data: BatchDeleteInventoryRequest,
    refrigeratorId?: string,
  ) => Promise<ApiSuccess<Record<string, never>>>;

  // 庫存概要（可選，若已用 include 可不呼叫）
  getSummary: (refrigeratorId?: string) => Promise<InventorySummaryResponse>;

  // 類別列表
  getCategories: (
    refrigeratorId?: string,
  ) => Promise<InventoryCategoriesResponse>;

  // 庫存設定
  getSettings: (refrigeratorId?: string) => Promise<InventorySettingsResponse>;
  updateSettings: (
    data: UpdateInventorySettingsRequest,
    refrigeratorId?: string,
  ) => Promise<InventorySettingsResponse>;

  // 消耗食材
  consumeItem: (
    id: string,
    data: { quantity: number; reasons: string[]; customReason?: string },
    refrigeratorId?: string,
  ) => Promise<ApiSuccess<{ id: string; remainingQuantity: number }>>;
};

