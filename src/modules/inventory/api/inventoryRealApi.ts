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
  BatchAddInventoryRequest,
  BatchUpdateInventoryRequest,
  BatchDeleteInventoryRequest,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest,
  CategoryInfo,
} from '../types';
import { MOCK_INVENTORY, MOCK_CATEGORIES } from './mock/inventoryMockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const inventoryApi = {
  /**
   * 取得庫存列表
   */
  getItems: async (params?: GetInventoryRequest): Promise<GetInventoryResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        items: MOCK_INVENTORY,
        total: MOCK_INVENTORY.length,
        stats: {
          totalItems: MOCK_INVENTORY.length,
          expiredCount: 0,
          expiringSoonCount: 0,
          lowStockCount: 0,
          byCategory: {
            '蔬果類': 0, '冷凍調理類': 0, '主食烘焙類': 0, '乳製品飲料類': 0,
            '冷凍海鮮類': 0, '肉品類': 0, '其他': 0
          }
        }
      };
    }
    return apiClient.get<GetInventoryResponse>('/inventory', params);
  },

  /**
   * 取得單一食材
   */
  getItem: async (id: string): Promise<FoodItem> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const item = MOCK_INVENTORY.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      return item;
    }
    return apiClient.get<FoodItem>(`/inventory/${id}`);
  },

  /**
   * 新增食材
   */
  addItem: async (data: AddFoodItemRequest): Promise<AddFoodItemResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, message: 'Added', data: { id: 'mock-id' } };
    }
    return apiClient.post<AddFoodItemResponse>('/inventory', data);
  },

  /**
   * 更新食材
   */
  updateItem: async (id: string, data: UpdateFoodItemRequest): Promise<UpdateFoodItemResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, message: 'Updated' };
    }
    return apiClient.put<UpdateFoodItemResponse>(`/inventory/${id}`, data);
  },

  /**
   * 刪除食材
   */
  deleteItem: async (id: string): Promise<DeleteFoodItemResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, message: 'Deleted' };
    }
    return apiClient.delete<DeleteFoodItemResponse>(`/inventory/${id}`);
  },

  /**
   * 批次新增
   */
  batchAdd: async (data: BatchAddInventoryRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.post<void>('/inventory/batch', data);
  },

  /**
   * 批次更新
   */
  batchUpdate: async (data: BatchUpdateInventoryRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.put<void>('/inventory/batch', data);
  },

  /**
   * 批次刪除
   */
  batchDelete: async (data: BatchDeleteInventoryRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.delete<void>('/inventory/batch', { body: JSON.stringify(data) } as any); // delete with body
  },

  /**
   * 取得統計
   */
  getStats: async (groupId?: string): Promise<InventoryStats> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        totalItems: MOCK_INVENTORY.length,
        expiredCount: 0,
        expiringSoonCount: 0,
        lowStockCount: 0,
        byCategory: {
          '蔬果類': 0, '冷凍調理類': 0, '主食烘焙類': 0, '乳製品飲料類': 0,
          '冷凍海鮮類': 0, '肉品類': 0, '其他': 0
        }
      };
    }
    return apiClient.get<InventoryStats>('/inventory/stats', { groupId });
  },

  /**
   * 取得概況
   */
  getSummary: async (): Promise<InventorySummary> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { total: 10, expiring: 2, expired: 1, lowStock: 3 };
    }
    return apiClient.get<InventorySummary>('/inventory/summary');
  },

  /**
   * 取得分類
   */
  getCategories: async (): Promise<CategoryInfo[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_CATEGORIES;
    }
    return apiClient.get<CategoryInfo[]>('/inventory/categories');
  },

  /**
   * 取得設定
   */
  getSettings: async (): Promise<InventorySettings> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { lowStockThreshold: 2, expiringSoonDays: 3, notifyOnExpiry: true, notifyOnLowStock: true };
    }
    return apiClient.get<InventorySettings>('/inventory/settings');
  },

  /**
   * 更新設定
   */
  updateSettings: async (data: UpdateInventorySettingsRequest): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.put<void>('/inventory/settings', data);
  },
};
