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

    // Best-effort mapping to FoodItemInput; provide sensible defaults
    const today = new Date().toISOString().slice(0, 10);
    const mapped: FoodItemInput = {
      productName: payload.productName ?? payload.name ?? '',
      category: (payload.category ?? '其他') as FoodItemInput['category'],
      attributes: (payload.attributes ?? '常溫') as FoodItemInput['attributes'],
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
    // 庫存 API 已遷移至主後端
    return backendApi.post<FoodItemResponse>('/api/v1/inventory', data);
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
