export type AnalyzeResponse = {
  success: boolean;
  data: {
    // 產品資訊
    productName: string; // 產品名
    category: string; // 分類
    attributes: string; // 屬性
    purchaseQuantity: number; // 購物數量
    unit: string; // 單位

    // 日期設定
    purchaseDate: string; // 購物日期
    expiryDate: string; // 過期日期

    // 低庫存提醒
    lowStockAlert: boolean; // 開啟通知（預設 true）
    lowStockThreshold: number; // 低庫存數量通知（預設 2）

    // 備註
    notes: string; // 備註
  };
  timestamp: string;
};

export const recognizeImage = async (
  imageUrl: string,
): Promise<AnalyzeResponse> => {
  const apiUrl = import.meta.env.VITE_RECIPE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_RECIPE_API_URL is not defined');
  }

  const response = await fetch(`${apiUrl}/recipe/analyze-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  // console.log('API Status:', response.status, response.statusText);
  // console.log('API Response:', response);
  return response.json();
};
