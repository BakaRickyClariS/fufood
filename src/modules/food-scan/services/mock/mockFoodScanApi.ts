import type { FoodScanApi } from '../api/foodScanApi';
import type { ScanResult, MultipleScanResult } from '../../types/scanResult';
import type {
  FoodItemInput,
  FoodItemResponse,
  FoodItemFilters,
  FoodItem,
} from '../../types/foodItem';
import { MOCK_SCAN_RESULTS } from './mockData';

import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

export const createMockFoodScanApi = (): FoodScanApi => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  let memoryItems: FoodItem[] | null = null;

  const getStoredItems = (): FoodItem[] => {
    if (mockRequestHandlers.shouldResetData()) {
      mockRequestHandlers.resetData(['mock_food_items']);
      memoryItems = null;
    }
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryItems) {
      return memoryItems;
    }
    const stored = mockRequestHandlers.getItem('mock_food_items');
    if (stored) {
      memoryItems = JSON.parse(stored);
      return memoryItems!;
    }
    return [];
  };

  const saveStoredItems = (items: FoodItem[]) => {
    memoryItems = items;
    mockRequestHandlers.setItem('mock_food_items', JSON.stringify(items));
  };

  const recognizeImage = async (_imageUrl: string): Promise<ScanResult> => {
    await delay(1500);
    const mockResult =
      MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)];
    return {
      success: true,
      data: mockResult,
      timestamp: new Date().toISOString(),
    };
  };

  const recognizeMultipleImages = async (
    _file: File,
    options?: { cropImages?: boolean; maxIngredients?: number },
  ): Promise<MultipleScanResult> => {
    await delay(2000);
    const max = options?.maxIngredients || 5;
    const count = Math.min(
      Math.max(1, Math.floor(Math.random() * max) + 1),
      max,
    );

    // generate multiple mock results
    const ingredients = Array.from({ length: count }).map((_, i) => {
      const mockBase =
        MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)];
      return {
        ...mockBase,
        imageUrl: `https://loremflickr.com/150/150/food?random=${i}`, // mock cropped image
        boundingBox: {
          x: 0.1 * i,
          y: 0.1,
          width: 0.2,
          height: 0.2,
        },
        confidence: 0.8 + Math.random() * 0.2,
      };
    });

    return {
      success: true,
      data: {
        originalImageUrl: 'https://loremflickr.com/600/800/food',
        totalCount: ingredients.length,
        ingredients,
        analyzedAt: new Date().toISOString(),
      },
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

    const existing = getStoredItems();
    existing.push(newItem);
    saveStoredItems(existing);

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
    const items = getStoredItems();
    const index = items.findIndex((item: FoodItem) => item.id === id);

    if (index === -1) {
      throw new Error('Item not found');
    }

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveStoredItems(items);

    return { success: true, message: '更新成功', data: { id } };
  };

  const deleteFoodItem = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    const items = getStoredItems();
    const filtered = items.filter((item: FoodItem) => item.id !== id);
    saveStoredItems(filtered);

    return { success: true };
  };

  const getFoodItems = async (
    filters?: FoodItemFilters,
  ): Promise<FoodItem[]> => {
    await delay(600);
    let items = getStoredItems();

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
    recognizeMultipleImages,
    submitFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getFoodItems,
  };
};
