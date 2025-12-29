import { aiApi, backendApi } from '@/api/client';
import type {
  FoodScanApi,
  ScanResult,
  MultipleScanResult,
  FoodItemInput,
  FoodItemResponse,
  FoodItemFilters,
  FoodItem,
} from '../../types';

import { categories } from '@/modules/inventory/constants/categories';

// Internal type for raw API response
type RawScanResponsePayload = {
  productName?: string;
  name?: string;
  category?: string;
  attributes?: string;
  purchaseQuantity?: number | string;
  unit?: string;
  purchaseDate?: string;
  expiryDate?: string;
  lowStockAlert?: boolean;
  lowStockThreshold?: number | string;
  notes?: string;
  imageUrl?: string;
};

type RawScanResponse = RawScanResponsePayload & {
  data?: RawScanResponsePayload;
};

export const createRealFoodScanApi = (): FoodScanApi => {
  const transformScanResult = (resp: unknown): ScanResult => {
    // Cast to unknown first then RawScanResponse to be safe
    const payload =
      (resp as { data?: RawScanResponse })?.data ??
      (resp as RawScanResponse) ??
      {};

    // Helper to find the closest matching category from our constant list
    const normalizeCategory = (input?: string): string => {
      if (!input) return 'others';

      // 1. Check if input is already a valid English ID
      const validIds = categories.map((c) => c.id);
      if (validIds.includes(input)) return input;

      // 2. Try exact match with title
      const exactMatch = categories.find((c) => c.title === input);
      if (exactMatch) return exactMatch.id;

      // 3. Try partial match with title or keywords
      if (input.includes('菜') || input.includes('果')) return 'fruit';
      if (
        input.includes('肉') ||
        input.includes('牛') ||
        input.includes('豬') ||
        input.includes('雞')
      )
        return 'meat';
      if (
        input.includes('海鮮') ||
        input.includes('魚') ||
        input.includes('蝦')
      )
        return 'seafood';
      if (
        input.includes('奶') ||
        input.includes('蛋') ||
        input.includes('喝') ||
        input.includes('乳')
      )
        return 'milk';
      if (input.includes('凍') || input.includes('冰')) return 'frozen';
      if (input.includes('麵') || input.includes('飯') || input.includes('粉'))
        return 'bake';

      return 'others';
    };

    const normalizeAttributes = (
      categoryId: string,
      input?: string,
    ): string => {
      // Return input if it's already a valid non-empty string and not one of the default titles
      if (input && input !== '常溫' && input !== '冷藏' && input !== '冷凍') {
        return input;
      }

      // Find category by ID (since we passed standardized ID)
      const catDef = categories.find((c) => c.id === categoryId);
      if (catDef && catDef.description.length > 0) {
        // Clean up the description string (remove punctuations if needed)
        // For simple fallback, just return the first part of description without commas
        const firstDesc = catDef.description[0].split('、')[0];
        return firstDesc;
      }
      return '其他';
    };

    const finalCategory = normalizeCategory(payload.category);
    const finalAttributes = normalizeAttributes(
      finalCategory,
      payload.attributes,
    );

    // Best-effort mapping to FoodItemInput; provide sensible defaults
    const today = new Date().toISOString().slice(0, 10);
    const mapped: FoodItemInput = {
      productName: payload.productName ?? payload.name ?? '',
      category: finalCategory as FoodItemInput['category'],
      attributes: finalAttributes
        ? finalAttributes
            .split(',')
            .map((attr) => attr.trim())
            .filter(Boolean)
        : [],
      purchaseQuantity: Number(payload.purchaseQuantity ?? 1),
      unit: (payload.unit ?? '份') as FoodItemInput['unit'],
      purchaseDate: payload.purchaseDate ?? today,
      expiryDate: payload.expiryDate ?? '',
      lowStockAlert: payload.lowStockAlert ?? true,
      lowStockThreshold: Number(payload.lowStockThreshold ?? 2),
      notes: payload.notes ?? '',
      imageUrl: payload.imageUrl ?? '',
    };

    return {
      success: true,
      data: mapped,
      timestamp: new Date().toISOString(),
    };
  };

  const recognizeImage = async (imageUrl: string): Promise<ScanResult> => {
    try {
      // Updated endpoint to match v2.1 spec
      const data = await aiApi.post<RawScanResponse>('/ai/analyze-image', {
        imageUrl,
      });
      return transformScanResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`FoodScan 分析錯誤：${message}`);
    }
  };

  /**
   * 辨識圖片中的多個食材 (Real API)
   */
  const recognizeMultipleImages = async (
    file: File,
    options?: { cropImages?: boolean; maxIngredients?: number },
  ): Promise<MultipleScanResult> => {
    try {
      const { cropImages = true, maxIngredients = 10 } = options || {};

      const formData = new FormData();
      formData.append('file', file);
      formData.append('cropImages', String(cropImages));
      formData.append('maxIngredients', String(maxIngredients));

      // Updated endpoint to match v2.1 spec
      const response = await aiApi.post<MultipleScanResult>(
        '/ai/analyze-image/multiple',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`FoodScan 多重分析錯誤：${message}`);
    }
  };

  const submitFoodItem = async (
    data: FoodItemInput,
  ): Promise<FoodItemResponse> => {
    // 將前端 FoodItemInput 格式轉換為 API 預期的 FoodItem 格式
    const apiPayload = {
      name: data.productName, // productName → name
      category: data.category,
      quantity: data.purchaseQuantity, // purchaseQuantity → quantity
      unit: data.unit,
      purchaseDate: data.purchaseDate,
      expiryDate: data.expiryDate || undefined,
      lowStockAlert: data.lowStockAlert,
      lowStockThreshold: data.lowStockThreshold,
      notes: data.notes,
      imageUrl: data.imageUrl,
      attributes: Array.isArray(data.attributes)
        ? data.attributes
        : typeof data.attributes === 'string'
          ? [data.attributes]
          : [],
    };

    // 庫存 API 在 AI 後端上 (/refrigerators/{id}/inventory)
    if (data.groupId) {
      return aiApi.post<FoodItemResponse>(
        `/refrigerators/${data.groupId}/inventory`,
        apiPayload,
      );
    }

    // 如果沒有 groupId，嘗試從 localStorage 取得
    const cachedId = localStorage.getItem('activeRefrigeratorId');
    if (cachedId) {
      return aiApi.post<FoodItemResponse>(
        `/refrigerators/${cachedId}/inventory`,
        apiPayload,
      );
    }

    // 最後 fallback：拋出錯誤提示使用者需要選擇冰箱
    throw new Error('無法入庫：請先選擇一個冰箱群組');
  };

  const updateFoodItem = async (
    id: string,
    data: Partial<FoodItemInput>,
  ): Promise<FoodItemResponse> => {
    // 庫存 API 已遷移至主後端
    return backendApi.put<FoodItemResponse>(`/api/v1/inventory/${id}`, data);
  };

  const deleteFoodItem = async (id: string): Promise<{ success: boolean }> => {
    // 庫存 API 已遷移至主後端
    return backendApi.delete<{ success: boolean }>(`/api/v1/inventory/${id}`);
  };

  const getFoodItems = async (
    filters?: FoodItemFilters,
  ): Promise<FoodItem[]> => {
    // 庫存 API 已遷移至主後端
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.status) params.status = filters.status;

    const response = await backendApi.get<{ items: FoodItem[] }>(
      '/api/v1/inventory',
      params,
    );
    return response.items;
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
