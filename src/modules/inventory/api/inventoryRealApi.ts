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
  BatchOperationRequest,
} from '../types';
import type { InventoryApi } from './inventoryApi';

export const createRealInventoryApi = (): InventoryApi => {
  return {
    /**
     * 取得庫存列表
     */
    getItems: async (params?: GetInventoryRequest): Promise<GetInventoryResponse> => {
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
    updateItem: async (id: string, data: UpdateFoodItemRequest): Promise<UpdateFoodItemResponse> => {
      return apiClient.put<UpdateFoodItemResponse>(`/inventory/${id}`, data);
    },

    /**
     * 刪除食材
     */
    deleteItem: async (id: string): Promise<DeleteFoodItemResponse> => {
      return apiClient.delete<DeleteFoodItemResponse>(`/inventory/${id}`);
    },

    /**
     * 批次操作
     */
    batchOperation: async (data: BatchOperationRequest): Promise<{ success: boolean }> => {
      // Map generic batch operation to specific API calls
      switch (data.operation) {
        case 'delete':
          await apiClient.delete<void>('/inventory/batch', { body: JSON.stringify({ ids: data.itemIds }) } as any);
          break;
        case 'add':
           // Assuming data.data contains items
           if (data.data?.items) {
             await apiClient.post<void>('/inventory/batch', { items: data.data.items });
           }
           break;
        case 'update':
           if (data.data?.items) {
             await apiClient.put<void>('/inventory/batch', { items: data.data.items });
           }
           break;
        default:
          console.warn('Unsupported batch operation:', data.operation);
      }
      
      return { success: true };
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
    updateSettings: async (data: UpdateInventorySettingsRequest): Promise<void> => {
      return apiClient.put<void>('/inventory/settings', data);
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createRealInventoryApi
export const inventoryApi = createRealInventoryApi();
