import { backendApi } from '@/api/client';
import type {
  FoodItem,
  GetInventoryRequest,
  AddFoodItemRequest,
  AddFoodItemResponse,
  UpdateFoodItemRequest,
  UpdateFoodItemResponse,
  DeleteFoodItemResponse,
  UpdateInventorySettingsRequest,
  BatchDeleteInventoryRequest,
  GetInventoryResponse,
  InventorySummaryResponse,
  InventoryCategoriesResponse,
  InventorySettingsResponse,
  ApiSuccess,
} from '../types';
import type { InventoryApi } from './inventoryApi';

export const createInventoryApi = (): InventoryApi => {
  return {
    /**
     * 取得庫存列表
     */
    getInventory: async (
      params?: GetInventoryRequest,
    ): Promise<GetInventoryResponse> => {
      return backendApi.get<GetInventoryResponse>('/inventory', params);
    },

    /**
     * 取得單一食材
     */
    getItem: async (id: string): Promise<ApiSuccess<{ item: FoodItem }>> => {
      return backendApi.get<ApiSuccess<{ item: FoodItem }>>(`/inventory/${id}`);
    },

    /**
     * 新增食材
     */
    addItem: async (data: AddFoodItemRequest): Promise<AddFoodItemResponse> => {
      return backendApi.post<AddFoodItemResponse>('/inventory', data);
    },

    /**
     * 更新食材
     */
    updateItem: async (
      id: string,
      data: UpdateFoodItemRequest,
    ): Promise<UpdateFoodItemResponse> => {
      return backendApi.put<UpdateFoodItemResponse>(`/inventory/${id}`, data);
    },

    /**
     * 刪除食材
     */
    deleteItem: async (id: string): Promise<DeleteFoodItemResponse> => {
      return backendApi.delete<DeleteFoodItemResponse>(`/inventory/${id}`);
    },

    /**
     * 批次刪除（可選）
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
    ): Promise<ApiSuccess<Record<string, never>>> => {
      return backendApi.delete<ApiSuccess<Record<string, never>>>(
        '/inventory/batch',
        {
          body: data,
        },
      );
    },

    /**
     * 庫存概要（可選）
     */
    getSummary: async (): Promise<InventorySummaryResponse> => {
      return backendApi.get<InventorySummaryResponse>('/inventory/summary');
    },

    /**
     * 類別列表
     */
    getCategories: async (): Promise<InventoryCategoriesResponse> => {
      return backendApi.get<InventoryCategoriesResponse>(
        '/inventory/categories',
      );
    },

    /**
     * 庫存設定
     */
    getSettings: async (): Promise<InventorySettingsResponse> => {
      return backendApi.get<InventorySettingsResponse>('/inventory/settings');
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
    ): Promise<InventorySettingsResponse> => {
      return backendApi.put<InventorySettingsResponse>(
        '/inventory/settings',
        data,
      );
    },

    /**
     * 消耗食材
     */
    consumeItem: async (
      id: string,
      data: { quantity: number; reasons: string[]; customReason?: string },
    ): Promise<ApiSuccess<{ id: string; remainingQuantity: number }>> => {
      return backendApi.post<
        ApiSuccess<{ id: string; remainingQuantity: number }>
      >(`/inventory/${id}/consume`, data);
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createInventoryApi
export const inventoryApi = createInventoryApi();
