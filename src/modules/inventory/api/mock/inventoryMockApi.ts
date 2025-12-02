import type { InventoryApi } from '../inventoryApi';
import type { 
  GetInventoryRequest, 
  GetInventoryResponse, 
  AddFoodItemRequest, 
  AddFoodItemResponse, 
  UpdateFoodItemRequest, 
  UpdateFoodItemResponse, 
  DeleteFoodItemResponse, 
  BatchOperationRequest,
  FoodItem,
  CategoryInfo,
  InventoryStats,
  InventorySummary,
  InventorySettings,
  UpdateInventorySettingsRequest
} from '../../types';
import { MOCK_INVENTORY } from './inventoryMockData';
import { categories } from '../../constants/categories'; // 暫時引用舊的 constants，之後會遷移

export const createMockInventoryApi = (): InventoryApi => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // 使用 localStorage 模擬持久化
  const getStoredItems = (): FoodItem[] => {
    const stored = localStorage.getItem('mock_inventory_items');
    return stored ? JSON.parse(stored) : MOCK_INVENTORY;
  };

  const setStoredItems = (items: FoodItem[]) => {
    localStorage.setItem('mock_inventory_items', JSON.stringify(items));
  };

  // 初始化 localStorage
  if (!localStorage.getItem('mock_inventory_items')) {
    setStoredItems(MOCK_INVENTORY);
  }

  const getItems = async (params?: GetInventoryRequest): Promise<GetInventoryResponse> => {
    await delay(500);
    let items = getStoredItems();

    // 篩選
    if (params?.groupId) {
      items = items.filter(item => item.groupId === params.groupId);
    }
    if (params?.category) {
      items = items.filter(item => item.category === params.category);
    }
    if (params?.status) {
      const today = new Date();
      const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      items = items.filter(item => {
        const expiry = new Date(item.expiryDate);
        switch (params.status) {
          case 'expired': return expiry < today;
          case 'expiring-soon': return expiry >= today && expiry <= threeDaysLater;
          case 'low-stock': return item.lowStockAlert && item.quantity <= item.lowStockThreshold;
          case 'normal': return expiry > threeDaysLater && (!item.lowStockAlert || item.quantity > item.lowStockThreshold);
          default: return true;
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
        '蔬果類': 0,
        '冷凍調理類': 0,
        '主食烘焙類': 0,
        '乳製品飲料類': 0,
        '冷凍海鮮類': 0,
        '肉品類': 0,
        '其他': 0
      }
    };

    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    items.forEach(item => {
      const expiry = new Date(item.expiryDate);
      if (expiry < today) stats.expiredCount++;
      if (expiry >= today && expiry <= threeDaysLater) stats.expiringSoonCount++;
      if (item.lowStockAlert && item.quantity <= item.lowStockThreshold) stats.lowStockCount++;
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
      stats
    };
  };

  const getItem = async (id: string): Promise<FoodItem> => {
    await delay(300);
    const items = getStoredItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  };

  const addItem = async (data: AddFoodItemRequest): Promise<AddFoodItemResponse> => {
    await delay(800);
    const items = getStoredItems();
    const newItem: FoodItem = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    setStoredItems(items);
    
    return {
      success: true,
      message: '新增成功',
      data: { id: newItem.id }
    };
  };

  const updateItem = async (id: string, data: UpdateFoodItemRequest): Promise<UpdateFoodItemResponse> => {
    await delay(500);
    const items = getStoredItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');
    
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    setStoredItems(items);

    return {
      success: true,
      message: '更新成功'
    };
  };

  const deleteItem = async (id: string): Promise<DeleteFoodItemResponse> => {
    await delay(500);
    const items = getStoredItems();
    const filtered = items.filter(i => i.id !== id);
    setStoredItems(filtered);

    return {
      success: true,
      message: '刪除成功'
    };
  };

  const batchOperation = async (data: BatchOperationRequest): Promise<{ success: boolean }> => {
    await delay(1000);
    let items = getStoredItems();
    
    switch (data.operation) {
      case 'delete':
        items = items.filter(i => !data.itemIds.includes(i.id));
        break;
      case 'update-category':
        items = items.map(i => data.itemIds.includes(i.id) ? { ...i, category: data.data?.category } : i);
        break;
      // 其他操作...
    }
    
    setStoredItems(items);
    return { success: true };
  };

  const getStats = async (_groupId?: string): Promise<InventoryStats> => {
    await delay(300);
    const { stats } = await getItems();
    return stats;
  };

  const getCategories = async (): Promise<CategoryInfo[]> => {
    await delay(200);
    // 轉換舊的 categories 格式
    return categories.map(c => ({
      id: c.id,
      title: c.title,
      count: c.value,
      imageUrl: c.img,
      bgColor: c.bgColor,
      slogan: c.slogan,
      description: c.description
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

    items.forEach(item => {
      const expiry = new Date(item.expiryDate);
      if (expiry < today) expiredCount++;
      else if (expiry >= today && expiry <= threeDaysLater) expiringCount++;
      if (item.lowStockAlert && item.quantity <= item.lowStockThreshold) lowStockCount++;
    });

    return {
      total: items.length,
      expiring: expiringCount,
      expired: expiredCount,
      lowStock: lowStockCount
    };
  };

  const getSettings = async (): Promise<InventorySettings> => {
    await delay(200);
    // 從 localStorage 取得設定，或使用預設值
    const stored = localStorage.getItem('mock_inventory_settings');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      lowStockThreshold: 2,
      expiringSoonDays: 3,
      notifyOnExpiry: true,
      notifyOnLowStock: true
    };
  };

  const updateSettings = async (data: UpdateInventorySettingsRequest): Promise<void> => {
    await delay(300);
    const current = await getSettings();
    const updated = { ...current, ...data };
    localStorage.setItem('mock_inventory_settings', JSON.stringify(updated));
  };

  return {
    getItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    batchOperation,
    getStats,
    getCategories,
    getSummary,
    getSettings,
    updateSettings
  };
};
