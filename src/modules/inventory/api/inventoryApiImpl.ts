import { aiApi } from '@/api/client';
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
    /**
     * 取得庫存列表
     */
    getInventory: async (
      params?: GetInventoryRequest,
    ): Promise<GetInventoryResponse> => {
      const refrigeratorId = params?.refrigeratorId || params?.groupId;
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for getInventory');
      }

      return aiApi.get<GetInventoryResponse>(
        `/refrigerators/${refrigeratorId}/inventory`,
        params,
      );
    },

    /**
     * 取得單一食材
     */
    getItem: async (
      id: string,
      refrigeratorId?: string,
    ): Promise<ApiSuccess<{ item: FoodItem }>> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for getItem');
      }
      return aiApi.get<ApiSuccess<{ item: FoodItem }>>(
        `/refrigerators/${refrigeratorId}/inventory/${id}`,
      );
    },

    /**
     * 新增食材
     */
    addItem: async (
      data: AddFoodItemRequest,
      refrigeratorId?: string,
    ): Promise<AddFoodItemResponse> => {
      const targetId = refrigeratorId || data.groupId;
      if (!targetId) {
        throw new Error('Refrigerator ID is required for addItem');
      }
      return aiApi.post<AddFoodItemResponse>(
        `/refrigerators/${targetId}/inventory`,
        data,
      );
    },

    /**
     * 更新食材
     */
    updateItem: async (
      id: string,
      data: UpdateFoodItemRequest,
      refrigeratorId?: string,
    ): Promise<UpdateFoodItemResponse> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for updateItem');
      }
      return aiApi.put<UpdateFoodItemResponse>(
        `/refrigerators/${refrigeratorId}/inventory/${id}`,
        data,
      );
    },

    /**
     * 刪除食材
     */
    deleteItem: async (
      id: string,
      refrigeratorId?: string,
    ): Promise<DeleteFoodItemResponse> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for deleteItem');
      }
      return aiApi.delete<DeleteFoodItemResponse>(
        `/refrigerators/${refrigeratorId}/inventory/${id}`,
      );
    },

    /**
     * 批次刪除（可選）
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
      refrigeratorId?: string,
    ): Promise<ApiSuccess<Record<string, never>>> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for batchDelete');
      }
      return aiApi.delete<ApiSuccess<Record<string, never>>>(
        `/refrigerators/${refrigeratorId}/inventory/batch`,
        {
          body: data,
        },
      );
    },

    /**
     * 庫存概要（可選）
     */
    getSummary: async (
      refrigeratorId?: string,
    ): Promise<InventorySummaryResponse> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for getSummary');
      }
      return aiApi.get<InventorySummaryResponse>(
        `/refrigerators/${refrigeratorId}/inventory/summary`,
      );
    },

    /**
     * 類別列表
     */
    getCategories: async (
      refrigeratorId?: string,
    ): Promise<InventoryCategoriesResponse> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for getCategories');
      }
      return aiApi.get<InventoryCategoriesResponse>(
        `/refrigerators/${refrigeratorId}/inventory/categories`,
      );
    },

    /**
     * 庫存設定
     */
    getSettings: async (
      refrigeratorId?: string,
    ): Promise<InventorySettingsResponse> => {
      if (!refrigeratorId) {
        // Fallback or Error? Doc says path is required.
        // But SettingsPanel loads it from params.
        throw new Error('Refrigerator ID is required for getSettings');
      }
      return aiApi.get<InventorySettingsResponse>(
        `/refrigerators/${refrigeratorId}/inventory/settings`,
      );
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
      refrigeratorId?: string,
    ): Promise<InventorySettingsResponse> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for updateSettings');
      }
      return aiApi.put<InventorySettingsResponse>(
        `/refrigerators/${refrigeratorId}/inventory/settings`,
        data,
      );
    },

    /**
     * 消耗食材
     */
    consumeItem: async (
      id: string,
      data: { quantity: number; reasons: string[]; customReason?: string },
      refrigeratorId?: string,
    ): Promise<ApiSuccess<{ id: string; remainingQuantity: number }>> => {
      if (!refrigeratorId) {
        throw new Error('Refrigerator ID is required for consumeItem');
      }
      return aiApi.post<ApiSuccess<{ id: string; remainingQuantity: number }>>(
        `/refrigerators/${refrigeratorId}/inventory/${id}/consume`,
        data,
      );
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createInventoryApi
export const inventoryApi = createInventoryApi();
