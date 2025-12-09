import { apiClient } from '@/lib/apiClient';
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

export const createRealInventoryApi = (): InventoryApi => {
  return {
    /**
     * 取得庫存列表
     */
    getInventory: async (
      params?: GetInventoryRequest,
    ): Promise<GetInventoryResponse> => {
      return apiClient.get<GetInventoryResponse>('/inventory', params);
    },

    /**
     * 取得單一食材
     */
    getItem: async (
      id: string,
    ): Promise<ApiSuccess<{ item: FoodItem }>> => {
      return apiClient.get<ApiSuccess<{ item: FoodItem }>>(
        `/inventory/${id}`,
      );
    },

    /**
     * 新增食材
     */
    addItem: async (data: AddFoodItemRequest): Promise<AddFoodItemResponse> => {
      return apiClient.post<AddFoodItemResponse>('/inventory', data);
    },

    /**
     * 更新食材
     */
    updateItem: async (
      id: string,
      data: UpdateFoodItemRequest,
    ): Promise<UpdateFoodItemResponse> => {
      return apiClient.put<UpdateFoodItemResponse>(`/inventory/${id}`, data);
    },

    /**
     * 刪除食材
     */
    deleteItem: async (id: string): Promise<DeleteFoodItemResponse> => {
      return apiClient.delete<DeleteFoodItemResponse>(`/inventory/${id}`);
    },

    /**
     * 批次刪除（可選）
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
    ): Promise<ApiSuccess<Record<string, never>>> => {
      return apiClient.delete<ApiSuccess<Record<string, never>>>(
        '/inventory/batch',
        {
          body: data,
        } as any,
      );
    },

    /**
     * 庫存概要（可選）
     */
    getSummary: async (): Promise<InventorySummaryResponse> => {
      return apiClient.get<InventorySummaryResponse>('/inventory/summary');
    },

    /**
     * 類別列表
     */
    getCategories: async (): Promise<InventoryCategoriesResponse> => {
      return apiClient.get<InventoryCategoriesResponse>('/inventory/categories');
    },

    /**
     * 庫存設定
     */
    getSettings: async (): Promise<InventorySettingsResponse> => {
      return apiClient.get<InventorySettingsResponse>('/inventory/settings');
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
    ): Promise<InventorySettingsResponse> => {
      return apiClient.put<InventorySettingsResponse>(
        '/inventory/settings',
        data,
      );
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createRealInventoryApi
export const inventoryApi = createRealInventoryApi();
