import { inventoryApi } from '../api';
import type { GetInventoryRequest, FoodItem, InventoryStatus } from '../types';

export const inventoryService = {
  // 包裝 API 呼叫
  getInventory: async (params?: GetInventoryRequest) => {
    const response = await inventoryApi.getInventory(params);
    return response.data;
  },

  // 本地計算邏輯：計算過期狀態
  calculateExpiryStatus: (
    expiryDate: string,
    quantity: number,
    lowStockAlert: boolean,
    lowStockThreshold: number,
  ): InventoryStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays >= 0 && diffDays <= 3) return 'expiring-soon';
    if (lowStockAlert && quantity <= lowStockThreshold) return 'low-stock';

    return 'normal';
  },

  // 排序邏輯
  sortItems: (
    items: FoodItem[],
    sortBy: keyof FoodItem | 'expiryDate',
    order: 'asc' | 'desc',
  ) => {
    const getComparableValue = (
      item: FoodItem,
    ): string | number | undefined => {
      const value = item[sortBy];
      if (
        sortBy === 'expiryDate' ||
        sortBy === 'purchaseDate' ||
        sortBy === 'createdAt'
      ) {
        return typeof value === 'string'
          ? new Date(value).getTime()
          : undefined;
      }

      if (typeof value === 'number' || typeof value === 'string') {
        return value;
      }

      return undefined;
    };

    return [...items].sort((a, b) => {
      const valA = getComparableValue(a);
      const valB = getComparableValue(b);

      if (valA === undefined || valB === undefined) {
        return 0;
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // 取得分類資訊
  getCategories: async () => {
    const response = await inventoryApi.getCategories();
    return response.data.categories;
  },
};
