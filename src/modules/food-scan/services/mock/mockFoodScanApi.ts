import type { FoodScanApi } from '../api/foodScanApi';
import type { ScanResult } from '../../types/scanResult';
import type {
  FoodItemInput,
  FoodItemResponse,
  FoodItemFilters,
  FoodItem,
} from '../../types/foodItem';
import { MOCK_SCAN_RESULTS } from './mockData';

export const createMockFoodScanApi = (): FoodScanApi => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const recognizeImage = async (_imageUrl: string): Promise<ScanResult> => {
    // 模擬網路延遲
    await delay(1500);

    // 隨機返回一個 mock 結果
    const mockResult =
      MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)];

    return {
      success: true,
      data: mockResult,
      timestamp: new Date().toISOString(),
    };
  };

  const submitFoodItem = async (
    data: FoodItemInput,
  ): Promise<FoodItemResponse> => {
    await delay(1000);

    const newItem = {
      id: `mock-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };

    // 可選：存入 localStorage 模擬持久化
    const existing = JSON.parse(
      localStorage.getItem('mock_food_items') || '[]',
    );
    existing.push(newItem);
    localStorage.setItem('mock_food_items', JSON.stringify(existing));

    return {
      success: true,
      message: '成功歸納至倉庫',
      data: { id: newItem.id },
    };
  };

  const updateFoodItem = async (
    id: string,
    data: Partial<FoodItemInput>,
  ): Promise<FoodItemResponse> => {
    await delay(800);
    const items = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
    const index = items.findIndex((item: FoodItem) => item.id === id);

    if (index === -1) {
      throw new Error('Item not found');
    }

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('mock_food_items', JSON.stringify(items));

    return { success: true, message: '更新成功', data: { id } };
  };

  const deleteFoodItem = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    const items = JSON.parse(localStorage.getItem('mock_food_items') || '[]');
    const filtered = items.filter((item: FoodItem) => item.id !== id);
    localStorage.setItem('mock_food_items', JSON.stringify(filtered));

    return { success: true };
  };

  const getFoodItems = async (
    filters?: FoodItemFilters,
  ): Promise<FoodItem[]> => {
    await delay(600);
    let items: FoodItem[] = JSON.parse(
      localStorage.getItem('mock_food_items') || '[]',
    );

    if (filters?.category) {
      items = items.filter(
        (item: FoodItem) => item.category === filters.category,
      );
    }

    if (filters?.isExpiringSoon) {
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      items = items.filter(
        (item: FoodItem) => new Date(item.expiryDate) <= threeDaysLater,
      );
    }

    if (filters?.isLowStock) {
      items = items.filter(
        (item: FoodItem) =>
          item.lowStockAlert && item.purchaseQuantity <= item.lowStockThreshold,
      );
    }

    return items;
  };

  return {
    recognizeImage,
    submitFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getFoodItems,
  };
};
