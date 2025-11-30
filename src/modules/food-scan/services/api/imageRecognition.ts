import type {
  FoodScanApi,
  ScanResult,
  FoodItemInput,
  FoodItemResponse,
  FoodItemFilters,
  FoodItem,
} from '../../types';

export const createRealFoodScanApi = (): FoodScanApi => {
  const baseURL = import.meta.env.VITE_RECIPE_API_URL || '';

  if (!baseURL) {
    throw new Error(
      '缺少 VITE_RECIPE_API_URL。請在 .env 設定（例如：http://localhost:3000/api/v1 或 /api/v1），或於開發先設 VITE_USE_MOCK_API=true。',
    );
  }

  // Normalize to avoid duplicate slashes
  const joinUrl = (base: string, path: string) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const transformScanResult = (resp: any): ScanResult => {
    const payload = resp?.data ?? resp ?? {};

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
      const url = joinUrl(baseURL, '/recipe/analyze-image');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(
          `影像辨識失敗：HTTP ${response.status} ${response.statusText}.\n` +
            `請求：POST ${url}\n` +
            `${body ? `回應：${body}` : ''}\n` +
            '請確認後端可連線、已開啟 CORS 或使用 Vite 代理，並檢查 VITE_RECIPE_API_URL。',
        );
      }

      const data = await response.json();
      return transformScanResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`FoodScan 分析錯誤：${message}`);
    }
  };

  const submitFoodItem = async (data: FoodItemInput): Promise<FoodItemResponse> => {
    const response = await fetch(`${baseURL}/food-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Submit Error: ${response.statusText}`);
    }

    return response.json();
  };

  const updateFoodItem = async (_id: string, _data: Partial<FoodItemInput>): Promise<FoodItemResponse> => {
      // Placeholder for real implementation
      throw new Error('Not implemented');
  };

  const deleteFoodItem = async (_id: string): Promise<{ success: boolean }> => {
      // Placeholder for real implementation
      throw new Error('Not implemented');
  };

  const getFoodItems = async (_filters?: FoodItemFilters): Promise<FoodItem[]> => {
      // Placeholder for real implementation
      throw new Error('Not implemented');
  };

  return {
    recognizeImage,
    submitFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getFoodItems,
  };
};
