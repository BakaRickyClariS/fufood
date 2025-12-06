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

// 混合模式：嘗試連接真實 API，失敗時切換到 Mock資料
const createHybridFoodScanApi = (): FoodScanApi => {
  const realApi = createRealFoodScanApi();
  const mockApi = createMockFoodScanApi();

  return {
    ...mockApi, // 預設使用 Mock 的其他方法 (如 delete/update/get)，也可以視需求改為 realApi
    // 對於掃描功能，優先嘗試真實 API
    recognizeImage: async (imageUrl: string) => {
      try {
        console.log('[FoodScan] 嘗試連接後端 API...');
        const result = await realApi.recognizeImage(imageUrl);
        console.log('[FoodScan] 後端 API 連接成功', result);
        return result;
      } catch (error) {
        console.warn(
          '[FoodScan] 後端 API 連接失敗，切換至 Mock 資料模式',
          error,
        );
        return mockApi.recognizeImage(imageUrl);
      }
    },
  };
};

export const foodScanApi: FoodScanApi = USE_MOCK
  ? createHybridFoodScanApi()
  : createRealFoodScanApi();

// 也可以提供手動切換的方法（用於開發/測試）
export const createFoodScanApi = (useMock: boolean): FoodScanApi => {
  return useMock ? createHybridFoodScanApi() : createRealFoodScanApi();
};
