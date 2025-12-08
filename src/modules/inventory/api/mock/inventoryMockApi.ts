import type { InventoryApi } from '../inventoryApi';
import type {
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
  FoodItem,
  CategoryInfo,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest,
} from '../../types';
import { MOCK_INVENTORY } from './inventoryMockData';
import { categories } from '../../constants/categories'; // 暫時引用舊的 constants，之後會遷移

import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

export const createMockInventoryApi = (): InventoryApi => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Memory cache
  let memoryItems: FoodItem[] | null = null;
  let memorySettings: InventorySettings | null = null;

  // 使用 mockRequestHandlers 模擬持久化
  const getStoredItems = (): FoodItem[] => {
    if (mockRequestHandlers.shouldResetData()) {
      mockRequestHandlers.resetData(['mock_inventory_items']);
      memoryItems = null;
    }

    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryItems) {
      return memoryItems;
    }

    const stored = mockRequestHandlers.getItem('mock_inventory_items');
    if (stored) {
      memoryItems = JSON.parse(stored);
      return memoryItems!;
    }

    // 初始化
    mockRequestHandlers.setItem(
      'mock_inventory_items',
      JSON.stringify(MOCK_INVENTORY),
    );
    memoryItems = [...MOCK_INVENTORY];
    return memoryItems;
  };

  const setStoredItems = (items: FoodItem[]) => {
    memoryItems = items;
    mockRequestHandlers.setItem('mock_inventory_items', JSON.stringify(items));
  };

  const getInventory = async (
    params?: GetInventoryRequest,
  ): Promise<GetInventoryResponse> => {
    await delay(500);
    let items = getStoredItems();

    // 篩選
    if (params?.groupId) {
      items = items.filter((item) => item.groupId === params.groupId);
    }
    if (params?.category) {
      items = items.filter((item) => item.category === params.category);
    }
    if (params?.status) {
      const today = new Date();
      const threeDaysLater = new Date(
        today.getTime() + 3 * 24 * 60 * 60 * 1000,
      );

      items = items.filter((item) => {
        const expiry = new Date(item.expiryDate);
        switch (params.status) {
          case 'expired':
            return expiry < today;
          case 'expiring-soon':
            return expiry >= today && expiry <= threeDaysLater;
          case 'low-stock':
            return (
              item.lowStockAlert && item.quantity <= item.lowStockThreshold
            );
          case 'normal':
            return (
              expiry > threeDaysLater &&
              (!item.lowStockAlert || item.quantity > item.lowStockThreshold)
            );
          default:
            return true;
        }
      });
    }

    // 統計
    const stats: InventoryStats = {
      totalItems: items.length,
      expiredCount: 0,
      expiringSoonCount: 0,
      lowStockCount: 0,
      byCategory: {
        蔬果類: 0,
        冷凍調理類: 0,
        主食烘焙類: 0,
        乳製品飲料類: 0,
        冷凍海鮮類: 0,
        肉品類: 0,
        其他: 0,
      },
    };

    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    items.forEach((item) => {
      const expiry = new Date(item.expiryDate);
      if (expiry < today) stats.expiredCount++;
      if (expiry >= today && expiry <= threeDaysLater)
        stats.expiringSoonCount++;
      if (item.lowStockAlert && item.quantity <= item.lowStockThreshold)
        stats.lowStockCount++;
      if (stats.byCategory[item.category] !== undefined) {
        stats.byCategory[item.category]++;
      }
    });

    // 分頁
    const page = params?.page || 1;
    const limit = params?.limit || 1000;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total: items.length,
      stats,
    };
  };

  const getItem = async (id: string): Promise<FoodItem> => {
    await delay(300);
    const items = getStoredItems();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  };

  const addItem = async (
    data: AddFoodItemRequest,
  ): Promise<AddFoodItemResponse> => {
    await delay(800);
    const items = getStoredItems();
    const newItem: FoodItem = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStoredItems(items);

    return {
      success: true,
      message: '新增成功',
      data: { id: newItem.id },
    };
  };

  const updateItem = async (
    id: string,
    data: UpdateFoodItemRequest,
  ): Promise<UpdateFoodItemResponse> => {
    await delay(500);
    const items = getStoredItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setStoredItems(items);

    return {
      success: true,
      message: '更新成功',
    };
  };

  const deleteItem = async (id: string): Promise<DeleteFoodItemResponse> => {
    await delay(500);
    const items = getStoredItems();
    const filtered = items.filter((i) => i.id !== id);
    setStoredItems(filtered);

    return {
      success: true,
      message: '刪除成功',
    };
  };

  const batchAdd = async (
    data: BatchAddInventoryRequest,
  ): Promise<{ success: boolean; message?: string }> => {
    await delay(1000);
    const items = getStoredItems();

    // Generate IDs for new items
    const newItems = data.items.map((item) => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // @ts-ignore - Ignore type check for quick mock implementation
    const updatedItems = [...items, ...newItems];
    setStoredItems(updatedItems);
    return { success: true };
  };

  const batchUpdate = async (
    data: BatchUpdateInventoryRequest,
  ): Promise<{ success: boolean; message?: string }> => {
    await delay(1000);
    const items = getStoredItems();
    // Simple implementation: update if ID exists
    // This is a simplified logic, real logic might be more complex
    return { success: true };
  };

  const batchDelete = async (
    data: BatchDeleteInventoryRequest,
  ): Promise<{ success: boolean; message?: string }> => {
    await delay(1000);
    let items = getStoredItems();
    items = items.filter((i) => !data.ids.includes(i.id));
    setStoredItems(items);
    return { success: true };
  };

  const getFrequentItems = async (limit?: number): Promise<FoodItem[]> => {
    await delay(500);
    const items = getStoredItems();
    // Return top N items as frequent items (mock logic: just take first N)
    return items.slice(0, limit || 5);
  };

  const getExpiredItems = async (
    page?: number,
    limit?: number,
  ): Promise<{ items: FoodItem[]; total: number }> => {
    await delay(500);
    const items = getStoredItems();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredItems = items.filter((item) => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      return expiry < today;
    });

    const p = page || 1;
    const l = limit || 20;
    const start = (p - 1) * l;
    const paginated = expiredItems.slice(start, start + l);

    return {
      items: paginated,
      total: expiredItems.length,
    };
  };

  const getStats = async (_groupId?: string): Promise<InventoryStats> => {
    await delay(300);
    const { stats } = await getInventory();
    return stats;
  };

  const getCategories = async (): Promise<CategoryInfo[]> => {
    await delay(200);
    // 轉換舊的 categories 格式
    return categories.map((c) => ({
      id: c.id,
      title: c.title,
      count: c.value,
      imageUrl: c.img,
      bgColor: c.bgColor,
      slogan: c.slogan,
      description: c.description,
    }));
  };

  const getSummary = async (): Promise<InventorySummary> => {
    await delay(300);
    const items = getStoredItems();
    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    let expiredCount = 0;
    let expiringCount = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      const expiry = new Date(item.expiryDate);
      if (expiry < today) expiredCount++;
      else if (expiry >= today && expiry <= threeDaysLater) expiringCount++;
      if (item.lowStockAlert && item.quantity <= item.lowStockThreshold)
        lowStockCount++;
    });

    return {
      total: items.length,
      expiring: expiringCount,
      expired: expiredCount,
      lowStock: lowStockCount,
    };
  };

  const getSettings = async (): Promise<InventorySettings> => {
    await delay(200);

    if (mockRequestHandlers.shouldResetData()) {
      mockRequestHandlers.resetData(['mock_inventory_settings']);
      memorySettings = null;
    }

    if (mockRequestHandlers.shouldUseMemoryOnly() && memorySettings) {
      return memorySettings;
    }

    const stored = mockRequestHandlers.getItem('mock_inventory_settings');
    if (stored) {
      memorySettings = JSON.parse(stored);
      return memorySettings!;
    }

    const defaults = {
      lowStockThreshold: 2,
      expiringSoonDays: 3,
      notifyOnExpiry: true,
      notifyOnLowStock: true,
    };
    memorySettings = defaults;
    mockRequestHandlers.setItem(
      'mock_inventory_settings',
      JSON.stringify(defaults),
    );
    return defaults;
  };

  const updateSettings = async (
    data: UpdateInventorySettingsRequest,
  ): Promise<void> => {
    await delay(300);
    const current = await getSettings();
    const updated = { ...current, ...data };
    memorySettings = updated;
    mockRequestHandlers.setItem(
      'mock_inventory_settings',
      JSON.stringify(updated),
    );
  };

  return {
    getInventory,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    batchAdd,
    batchUpdate,
    batchDelete,
    getFrequentItems,
    getExpiredItems,
    getStats,
    getCategories,
    getSummary,
    getSettings,
    updateSettings,
  };
};
