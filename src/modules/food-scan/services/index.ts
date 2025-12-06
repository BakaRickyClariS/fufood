import type { FoodScanApi } from '../types';
import { createRealFoodScanApi } from './api/imageRecognition';
import { createMockFoodScanApi } from './mock/mockFoodScanApi';

/**
 * 根據環境變數決定使用真實 API 或 Mock API
 *
 * 環境變數設定：
 * - VITE_USE_MOCK_API=true  → 使用假資料
 * - VITE_USE_MOCK_API=false → 使用真實 API
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const foodScanApi: FoodScanApi = USE_MOCK
  ? createMockFoodScanApi()
  : createRealFoodScanApi();

// 也可以提供手動切換的方法（用於開發/測試）
export const createFoodScanApi = (useMock: boolean): FoodScanApi => {
  return useMock ? createMockFoodScanApi() : createRealFoodScanApi();
};
