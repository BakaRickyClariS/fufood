import type { InventoryApi } from '../inventoryApi';
import type {
  GetInventoryRequest,
  GetInventoryResponse,
  AddFoodItemRequest,
  AddFoodItemResponse,
  UpdateFoodItemRequest,
  UpdateFoodItemResponse,
  DeleteFoodItemResponse,
  BatchDeleteInventoryRequest,
  FoodItem,
  CategoryInfo,
  FoodCategory,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest,
} from '../../types';
import { MOCK_INVENTORY } from './inventoryMockData';
import { categories } from '../../constants/categories';
import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

const createCategoryCounters = (): Record<FoodCategory, number> => ({
  蔬果類: 0,
  冷凍調理類: 0,
  主食烘焙類: 0,
  乳製品飲料類: 0,
  冷凍海鮮類: 0,
  肉品類: 0,
  其他: 0,
});

export const createMockInventoryApi = (): InventoryApi => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  let memoryItems: FoodItem[] | null = null;
  let memorySettings: InventorySettings | null = null;

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
    await delay(300);
    let items = getStoredItems();

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
          case 'frequent':
            return true; // mock 沒有頻率資料，直接交由分頁
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

    const stats: InventoryStats = {
      totalItems: items.length,
      expiredCount: 0,
      expiringSoonCount: 0,
      lowStockCount: 0,
      byCategory: createCategoryCounters(),
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

    const page = params?.page || 1;
    const limit = params?.limit || 1000;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    const base: GetInventoryResponse = {
      status: true,
      data: {
        items: paginatedItems,
        total: items.length,
      },
    };

    if (params?.include?.includes('stats')) {
      base.data.stats = stats;
    }

    if (params?.include?.includes('summary')) {
      base.data.summary = {
        total: items.length,
        expiring: stats.expiringSoonCount,
        expired: stats.expiredCount,
        lowStock: stats.lowStockCount,
      };
    }

    return base;
  };

  const getItem = async (
    id: string,
  ): Promise<{ status: true; data: { item: FoodItem } }> => {
    await delay(200);
    const items = getStoredItems();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Item not found');
    return { status: true, data: { item } };
  };

  const addItem = async (
    data: AddFoodItemRequest,
  ): Promise<AddFoodItemResponse> => {
    await delay(300);
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
      status: true,
      message: '新增成功',
      data: { id: newItem.id },
    };
  };

  const updateItem = async (
    id: string,
    data: UpdateFoodItemRequest,
  ): Promise<UpdateFoodItemResponse> => {
    await delay(300);
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
      status: true,
      message: '更新成功',
      data: { id },
    };
  };

  const deleteItem = async (id: string): Promise<DeleteFoodItemResponse> => {
    await delay(300);
    const items = getStoredItems();
    const filtered = items.filter((i) => i.id !== id);
    setStoredItems(filtered);

    return {
      status: true,
      message: '刪除成功',
      data: {},
    };
  };

  const batchDelete = async (
    data: BatchDeleteInventoryRequest,
  ): Promise<{ status: true; message?: string; data: Record<string, never> }> => {
    await delay(300);
    let items = getStoredItems();
    items = items.filter((i) => !data.ids.includes(i.id));
    setStoredItems(items);
    return { status: true, data: {} };
  };

  const getCategories = async (): Promise<{
    status: true;
    data: { categories: CategoryInfo[] };
  }> => {
    await delay(150);
    return {
      status: true,
      data: {
        categories: categories.map((c) => ({
          id: c.id,
          title: c.title,
          count: c.value,
          imageUrl: c.img,
          bgColor: c.bgColor,
          slogan: c.slogan,
          description: c.description,
        })),
      },
    };
  };

  const getSummary = async (): Promise<{
    status: true;
    data: { summary: InventorySummary };
  }> => {
    await delay(150);
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
      status: true,
      data: {
        summary: {
          total: items.length,
          expiring: expiringCount,
          expired: expiredCount,
          lowStock: lowStockCount,
        },
      },
    };
  };

  const getSettings = async (): Promise<{
    status: true;
    data: { settings: InventorySettings };
  }> => {
    await delay(150);

    if (mockRequestHandlers.shouldResetData()) {
      mockRequestHandlers.resetData(['mock_inventory_settings']);
      memorySettings = null;
    }

    if (mockRequestHandlers.shouldUseMemoryOnly() && memorySettings) {
      return { status: true, data: { settings: memorySettings } };
    }

    const stored = mockRequestHandlers.getItem('mock_inventory_settings');
    if (stored) {
      memorySettings = JSON.parse(stored);
      return { status: true, data: { settings: memorySettings! } };
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
    return { status: true, data: { settings: defaults } };
  };

  const updateSettings = async (
    data: UpdateInventorySettingsRequest,
  ): Promise<{ status: true; message?: string; data: { settings: InventorySettings } }> => {
    await delay(150);
    const current = await getSettings();
    const updated = { ...current.data.settings, ...data };
    memorySettings = updated;
    mockRequestHandlers.setItem(
      'mock_inventory_settings',
      JSON.stringify(updated),
    );
    return {
      status: true,
      message: 'Updated successfully',
      data: { settings: updated },
    };
  };

  return {
    getInventory,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    batchDelete,
    getCategories,
    getSummary,
    getSettings,
    updateSettings,
  };
};
