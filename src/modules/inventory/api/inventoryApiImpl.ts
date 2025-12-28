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
      const refrigeratorId = params?.groupId;
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.get<GetInventoryResponse>(baseUrl, params);
    },

    /**
     * 取得單一食材
     */
    getItem: async (
      id: string,
      refrigeratorId?: string,
    ): Promise<ApiSuccess<{ item: FoodItem }>> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.get<ApiSuccess<{ item: FoodItem }>>(`${baseUrl}/${id}`);
    },

    /**
     * 新增食材
     */
    addItem: async (
      data: AddFoodItemRequest,
      refrigeratorId?: string,
    ): Promise<AddFoodItemResponse> => {
      const targetId = refrigeratorId || data.groupId;
      const baseUrl = targetId
        ? `/refrigerators/${targetId}/inventory`
        : '/inventory';
      return backendApi.post<AddFoodItemResponse>(baseUrl, data);
    },

    /**
     * 更新食材
     */
    updateItem: async (
      id: string,
      data: UpdateFoodItemRequest,
      refrigeratorId?: string,
    ): Promise<UpdateFoodItemResponse> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.put<UpdateFoodItemResponse>(`${baseUrl}/${id}`, data);
    },

    /**
     * 刪除食材
     */
    deleteItem: async (
      id: string,
      refrigeratorId?: string,
    ): Promise<DeleteFoodItemResponse> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.delete<DeleteFoodItemResponse>(`${baseUrl}/${id}`);
    },

    /**
     * 批次刪除（可選）
     */
    batchDelete: async (
      data: BatchDeleteInventoryRequest,
      refrigeratorId?: string,
    ): Promise<ApiSuccess<Record<string, never>>> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.delete<ApiSuccess<Record<string, never>>>(
        `${baseUrl}/batch`,
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
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.get<InventorySummaryResponse>(`${baseUrl}/summary`);
    },

    /**
     * 類別列表
     */
    getCategories: async (
      refrigeratorId?: string,
    ): Promise<InventoryCategoriesResponse> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.get<InventoryCategoriesResponse>(
        `${baseUrl}/categories`,
      );
    },

    /**
     * 庫存設定
     */
    getSettings: async (
      refrigeratorId?: string,
    ): Promise<InventorySettingsResponse> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.get<InventorySettingsResponse>(`${baseUrl}/settings`);
    },

    /**
     * 更新設定
     */
    updateSettings: async (
      data: UpdateInventorySettingsRequest,
      refrigeratorId?: string,
    ): Promise<InventorySettingsResponse> => {
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.put<InventorySettingsResponse>(
        `${baseUrl}/settings`,
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
      const baseUrl = refrigeratorId
        ? `/refrigerators/${refrigeratorId}/inventory`
        : '/inventory';
      return backendApi.post<
        ApiSuccess<{ id: string; remainingQuantity: number }>
      >(`${baseUrl}/${id}/consume`, data);
    },
  };
};

// Export singleton for backward compatibility if needed, but index.ts uses createInventoryApi
export const inventoryApi = createInventoryApi();
