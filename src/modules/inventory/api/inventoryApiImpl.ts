import { aiApi } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
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
      const groupId = params?.groupId;
      if (!groupId) {
        throw new Error('Group ID is required for getInventory');
      }

      const { ...queryParams } = params || {};
      delete queryParams.groupId;

      return aiApi.get<GetInventoryResponse>(
        ENDPOINTS.INVENTORY.LIST(groupId),
        queryParams,
      );
    },

    /**
     * 取得單一食材
     */
    getItem: async (
      id: string,
      groupId?: string,
    ): Promise<ApiSuccess<{ item: FoodItem }>> => {
      if (!groupId) {
        throw new Error('Group ID is required for getItem');
      }
      return aiApi.get<ApiSuccess<{ item: FoodItem }>>(
        ENDPOINTS.INVENTORY.BY_ID(groupId, id),
      );
    },

    /**
     * 新增食材
     */
    addItem: async (
      data: AddFoodItemRequest,
      groupId?: string,
    ): Promise<AddFoodItemResponse> => {
      const targetId = groupId || data.groupId;
      if (!targetId) {
        throw new Error('Group ID is required for addItem');
      }
      return aiApi.post<AddFoodItemResponse>(
        ENDPOINTS.INVENTORY.LIST(targetId),
        data,
      );
    },

    /**
     * 更新食材
     */
    updateItem: async (
      id: string,
      data: UpdateFoodItemRequest,
      groupId?: string,
    ): Promise<UpdateFoodItemResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for updateItem');
      }
      return aiApi.put<UpdateFoodItemResponse>(
        ENDPOINTS.INVENTORY.BY_ID(groupId, id),
        data,
      );
    },

    /**
     * 刪除食材
     */
    deleteItem: async (
      id: string,
      groupId?: string,
    ): Promise<DeleteFoodItemResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for deleteItem');
      }
      return aiApi.delete<DeleteFoodItemResponse>(
        ENDPOINTS.INVENTORY.BY_ID(groupId, id),
      );
    },

    /**
     * 批次刪除（可選）
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
      groupId?: string,
    ): Promise<ApiSuccess<Record<string, never>>> => {
      if (!groupId) {
        throw new Error('Group ID is required for batchDelete');
      }
      return aiApi.delete<ApiSuccess<Record<string, never>>>(
        `${ENDPOINTS.INVENTORY.LIST(groupId)}/batch`,
        {
          body: data,
        },
      );
    },

    /**
     * 庫存概要（可選）
     */
    getSummary: async (groupId?: string): Promise<InventorySummaryResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for getSummary');
      }
      return aiApi.get<InventorySummaryResponse>(
        ENDPOINTS.INVENTORY.SUMMARY(groupId),
      );
    },

    /**
     * 類別列表
     */
    getCategories: async (
      groupId?: string,
    ): Promise<InventoryCategoriesResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for getCategories');
      }
      return aiApi.get<InventoryCategoriesResponse>(
        ENDPOINTS.INVENTORY.CATEGORIES(groupId),
      );
    },

    /**
     * 庫存設定
     */
    getSettings: async (
      groupId?: string,
    ): Promise<InventorySettingsResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for getSettings');
      }
      return aiApi.get<InventorySettingsResponse>(
        ENDPOINTS.INVENTORY.SETTINGS(groupId),
      );
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
      groupId?: string,
    ): Promise<InventorySettingsResponse> => {
      if (!groupId) {
        throw new Error('Group ID is required for updateSettings');
      }
      return aiApi.put<InventorySettingsResponse>(
        ENDPOINTS.INVENTORY.SETTINGS(groupId),
        data,
      );
    },

    /**
     * 消耗食材
     */
    consumeItem: async (
      id: string,
      data: { quantity: number; reasons: string[]; customReason?: string },
      groupId?: string,
    ): Promise<ApiSuccess<{ id: string; remainingQuantity: number }>> => {
      if (!groupId) {
        throw new Error('Group ID is required for consumeItem');
      }
      return aiApi.post<ApiSuccess<{ id: string; remainingQuantity: number }>>(
        ENDPOINTS.INVENTORY.CONSUME(groupId, id),
        data,
      );
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createInventoryApi
export const inventoryApi = createInventoryApi();
