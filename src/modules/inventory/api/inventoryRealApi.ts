import { apiClient } from '@/lib/apiClient';
import type {
  FoodItem,
  GetInventoryRequest,
  GetInventoryResponse,
  AddFoodItemRequest,
  AddFoodItemResponse,
  UpdateFoodItemRequest,
  UpdateFoodItemResponse,
  DeleteFoodItemResponse,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest,
  CategoryInfo,
  BatchAddInventoryRequest,
  BatchUpdateInventoryRequest,
  BatchDeleteInventoryRequest,
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
    getItem: async (id: string): Promise<FoodItem> => {
      return apiClient.get<FoodItem>(`/inventory/${id}`);
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
    ): Promise<{ success: boolean; message?: string }> => {
      return apiClient.post<{ success: boolean; message?: string }>(
        '/inventory/batch',
        data,
      );
    },

    /**
     * 批次更新
     */
    batchUpdate: async (
      data: BatchUpdateInventoryRequest,
    ): Promise<{ success: boolean; message?: string }> => {
      return apiClient.put<{ success: boolean; message?: string }>(
        '/inventory/batch',
        data,
      );
    },

    /**
     * 批次刪除
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
    ): Promise<{ success: boolean; message?: string }> => {
      return apiClient.delete<{ success: boolean; message?: string }>(
        '/inventory/batch',
        {
          body: data,
        } as any,
      );
    },

    /**
     * 取得常用項目
     */
    getFrequentItems: async (limit?: number): Promise<FoodItem[]> => {
      return apiClient.get<FoodItem[]>('/inventory/frequent', { limit });
    },

    /**
     * 取得過期紀錄
     */
    getExpiredItems: async (
      page?: number,
      limit?: number,
    ): Promise<{ items: FoodItem[]; total: number }> => {
      return apiClient.get<{ items: FoodItem[]; total: number }>(
        '/inventory/expired',
        { page, limit },
      );
    },

    /**
     * 取得統計
     */
    getStats: async (groupId?: string): Promise<InventoryStats> => {
      return apiClient.get<InventoryStats>('/inventory/stats', { groupId });
    },

    /**
     * 取得概況
     */
    getSummary: async (): Promise<InventorySummary> => {
      return apiClient.get<InventorySummary>('/inventory/summary');
    },

    /**
     * 取得分類
     */
    getCategories: async (): Promise<CategoryInfo[]> => {
      return apiClient.get<CategoryInfo[]>('/inventory/categories');
    },

    /**
     * 取得設定
     */
    getSettings: async (): Promise<InventorySettings> => {
      return apiClient.get<InventorySettings>('/inventory/settings');
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
    ): Promise<void> => {
      return apiClient.put<void>('/inventory/settings', data);
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createRealInventoryApi
export const inventoryApi = createRealInventoryApi();
