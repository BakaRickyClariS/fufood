import { aiApi } from '@/api/client';
import type {
  FoodScanApi,
  ScanResult,
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

  const submitFoodItem = async (
    data: FoodItemInput,
  ): Promise<FoodItemResponse> => {
    // Updated endpoint to match v2.1 spec (Inventory Module)
    return aiApi.post<FoodItemResponse>('/inventory', data);
  };

  const updateFoodItem = async (
    id: string,
    data: Partial<FoodItemInput>,
  ): Promise<FoodItemResponse> => {
    return aiApi.put<FoodItemResponse>(`/inventory/${id}`, data);
  };

  const deleteFoodItem = async (id: string): Promise<{ success: boolean }> => {
    return aiApi.delete<{ success: boolean }>(`/inventory/${id}`);
  };

  const getFoodItems = async (
    filters?: FoodItemFilters,
  ): Promise<FoodItem[]> => {
    // Mapping filters to query params
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.status) params.status = filters.status;

    const response = await aiApi.get<{ items: FoodItem[] }>(
      '/inventory',
      params,
    );
    return response.items;
  };

  return {
    recognizeImage,
    submitFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getFoodItems,
  };
};
