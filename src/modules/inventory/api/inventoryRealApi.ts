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
  BatchAddInventoryRequest,
  BatchUpdateInventoryRequest,
  BatchDeleteInventoryRequest,
  GetInventoryResponse,
  ExpiredItemsResponse,
  FrequentItemsResponse,
  InventoryStatsResponse,
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
      // Ensure path is correct based on agreed optimization plan (using base URL from client)
      // If client has base URL /api/v1, then this should be /inventory
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
     * 批次新增
     */
    batchAdd: async (
      data: BatchAddInventoryRequest,
    ): Promise<BatchOperationResponse> => {
      return apiClient.post<BatchOperationResponse>('/inventory/batch', data);
    },

    /**
     * 批次更新
     */
    batchUpdate: async (
      data: BatchUpdateInventoryRequest,
    ): Promise<BatchOperationResponse> => {
      return apiClient.put<BatchOperationResponse>('/inventory/batch', data);
    },

    /**
     * 批次刪除
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
    ): Promise<BatchOperationResponse> => {
      return apiClient.delete<BatchOperationResponse>(
        '/inventory/batch',
        {
          body: data,
        } as any,
      );
    },

    /**
     * 取得常用項目
     */
    getFrequentItems: async (
      limit?: number,
    ): Promise<FrequentItemsResponse> => {
      return apiClient.get<FrequentItemsResponse>('/inventory/frequent', {
        limit,
      });
    },

    /**
     * 取得過期紀錄
     */
    getExpiredItems: async (
      page?: number,
      limit?: number,
    ): Promise<ExpiredItemsResponse> => {
      return apiClient.get<ExpiredItemsResponse>('/inventory/expired', {
        page,
        limit,
      });
    },

    /**
     * 取得統計
     */
    getStats: async (
      groupId?: string,
    ): Promise<InventoryStatsResponse> => {
      return apiClient.get<InventoryStatsResponse>('/inventory/stats', {
        groupId,
      });
    },

    /**
     * 取得概況
     */
    getSummary: async (): Promise<InventorySummaryResponse> => {
      return apiClient.get<InventorySummaryResponse>('/inventory/summary');
    },

    /**
     * 取得分類
     */
    getCategories: async (): Promise<InventoryCategoriesResponse> => {
      return apiClient.get<InventoryCategoriesResponse>('/inventory/categories');
    },

    /**
     * 取得設定
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
