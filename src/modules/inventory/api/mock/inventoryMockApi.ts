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
  CategorySettingItem,
} from '../../types';
import { MOCK_INVENTORY } from './inventoryMockData';
import { categories } from '../../constants/categories';
import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

const createCategoryCounters = (): Record<FoodCategory, number> => {
  const counters: Record<FoodCategory, number> = {};
  MOCK_INVENTORY.forEach((item) => {
    counters[item.category] = 0;
  });
  return counters;
};

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
      const parsed = JSON.parse(stored) as FoodItem[];
      memoryItems = parsed;
      return parsed;
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
    if (params?.category && params.category !== 'all') {
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
            // Mock: return items with purchaseCount > 5 or just true for now
            return (item.purchaseCount || 0) > 5;
          case 'completed':
            return item.quantity === 0;
          case 'normal':
          default:
            return (
              expiry > threeDaysLater &&
              (!item.lowStockAlert || item.quantity > item.lowStockThreshold)
            );
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
      } as InventorySummary;
    }

    return base;
  };

  const getItem = async (
    id: string,
    _refrigeratorId?: string,
  ): Promise<{ status: true; data: { item: FoodItem } }> => {
    await delay(200);
    const items = getStoredItems();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Item not found');
    return { status: true, data: { item } };
  };

  const addItem = async (
    data: AddFoodItemRequest,
    _refrigeratorId?: string,
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
      message: 'Added item',
      data: { id: newItem.id },
    };
  };

  const updateItem = async (
    id: string,
    data: UpdateFoodItemRequest,
    _refrigeratorId?: string,
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
      message: 'Updated item',
      data: { id },
    };
  };

  const deleteItem = async (
    id: string,
    _refrigeratorId?: string,
  ): Promise<DeleteFoodItemResponse> => {
    await delay(300);
    const items = getStoredItems();
    const filtered = items.filter((i) => i.id !== id);
    setStoredItems(filtered);

    return {
      status: true,
      message: 'Deleted item',
      data: {},
    };
  };

  const batchDelete = async (
    data: BatchDeleteInventoryRequest,
    _refrigeratorId?: string,
  ): Promise<{
    status: true;
    message?: string;
    data: Record<string, never>;
  }> => {
    await delay(300);
    let items = getStoredItems();
    items = items.filter((i) => !data.ids.includes(i.id));
    setStoredItems(items);
    return { status: true, data: {} };
  };

  const getSummary = async (
    _refrigeratorId?: string,
  ): Promise<{
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

  const getSettings = async (
    _refrigeratorId?: string,
  ): Promise<{
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
      const parsed = JSON.parse(stored) as InventorySettings;
      memorySettings = parsed;
      return { status: true, data: { settings: parsed } };
    }

    // Default Settings based on constants/categories
    const defaultCategories: CategorySettingItem[] = categories.map(c => ({
      id: c.id,
      title: c.title,
      isVisible: true,
      subCategories: c.description, // Mapping description to subCategories for initial mock
    }));

    const defaults: InventorySettings = {
      lowStockThreshold: 2,
      expiringSoonDays: 3,
      notifyOnExpiry: true,
      notifyOnLowStock: true,
      layoutType: 'layout-a',
      categoryOrder: defaultCategories.map(c => c.id),
      categories: defaultCategories,
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
    _refrigeratorId?: string,
  ): Promise<{
    status: true;
    message?: string;
    data: { settings: InventorySettings };
  }> => {
    await delay(150);
    const current = await getSettings();

    // Partial update logic (recursive merge not needed for simple object like this unless categories changes)
    const updated: InventorySettings = {
      ...current.data.settings,
      ...data,
      // If data.categories is provided, it replaces the old one. We might want to merge if we were being fancy, but replacement is standard for optional array field
    };

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

  const getCategories = async (
    _refrigeratorId?: string,
  ): Promise<{
    status: true;
    data: { categories: CategoryInfo[] };
  }> => {
    await delay(150);

    // Get settings to check order and customized titles/visibility
    const settingsResponse = await getSettings();
    const { settings } = settingsResponse.data;
    
    // Create base category map
    const categoryMap = new Map<string, CategoryInfo>();
    
    // Add default categories
    categories.forEach(c => {
      categoryMap.set(c.id, {
        id: c.id,
        title: c.title,
        count: c.value,
        imageUrl: c.img,
        bgColor: c.bgColor,
        slogan: c.slogan,
        description: c.description,
      });
    });

    // Apply settings override (titles)
    if (settings.categories) {
      settings.categories.forEach(c => {
        const existing = categoryMap.get(c.id);
        if (existing) {
          // If title changed in settings, use it
          existing.title = c.title;
        }
      });
    }

    // Sort by settings.categoryOrder
    const result: CategoryInfo[] = [];
    if (settings.categoryOrder) {
      settings.categoryOrder.forEach(id => {
        const cat = categoryMap.get(id);
        if (cat) {
          result.push(cat);
          categoryMap.delete(id); // Remove so we don't add again
        }
      });
    }

    // specific business rule: should we include hidden categories in "getCategories"?
    // getCategories is mostly used for "Adding Items" -> dropdown should typically show ALL valid categories even if hidden in dashboard?
    // Or maybe we respect visibility? For now, I'll include all but sorted.
    
    // Add remaining categories
    categoryMap.forEach(cat => result.push(cat));

    return {
      status: true,
      data: { categories: result },
    };
  };

  const consumeItem = async (
    id: string,
    data: { quantity: number; reasons: string[]; customReason?: string },
    _refrigeratorId?: string,
  ): Promise<{
    status: true;
    message?: string;
    data: { id: string; remainingQuantity: number };
  }> => {
    await delay(300);
    const items = getStoredItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const item = items[index];
    const newQuantity = Math.max(0, item.quantity - data.quantity);

    items[index] = {
      ...item,
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    };
    setStoredItems(items);

    return {
      status: true,
      message: 'Consumed successfully',
      data: { id, remainingQuantity: newQuantity },
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
    consumeItem,
  };
};

