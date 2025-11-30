import type { ScanResult } from '../../types/scanResult';
import type { FoodItemInput, FoodItemResponse, FoodItemFilters, FoodItem } from '../../types/foodItem';

export type FoodScanApi = {
  /**
   * 辨識圖片中的食材
   */
  recognizeImage: (imageUrl: string) => Promise<ScanResult>;

  /**
   * 提交食材項目到倉庫
   */
  submitFoodItem: (data: FoodItemInput) => Promise<FoodItemResponse>;

  /**
   * 更新食材項目
   */
  updateFoodItem: (id: string, data: Partial<FoodItemInput>) => Promise<FoodItemResponse>;

  /**
   * 刪除食材項目
   */
  deleteFoodItem: (id: string) => Promise<{ success: boolean }>;

  /**
   * 取得食材項目列表
   */
  getFoodItems: (filters?: FoodItemFilters) => Promise<FoodItem[]>;
};
