export type FoodCategory = 
  | '蔬菜' 
  | '水果' 
  | '肉類' 
  | '海鮮' 
  | '乳製品' 
  | '飲品' 
  | '零食' 
  | '調味料' 
  | '其他';

export type FoodAttribute = '常溫' | '冷藏' | '冷凍';

export type FoodUnit = 
  | '個' 
  | '包' 
  | '瓶' 
  | '罐' 
  | '盒' 
  | 'kg' 
  | 'g' 
  | 'L' 
  | 'ml' 
  | '顆';

export type FoodItemInput = {
  productName: string;
  category: FoodCategory;
  attributes: FoodAttribute;
  purchaseQuantity: number;
  unit: FoodUnit;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes: string;
  imageUrl?: string;
};

export type FoodItem = FoodItemInput & {
  id: string;
  createdAt: string;
  updatedAt?: string;
};

export type FoodItemResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
};

export type FoodItemFilters = {
  category?: FoodCategory;
  attribute?: FoodAttribute;
  status?: string;          // Added for API compatibility
  isExpiringSoon?: boolean; // 即將過期
  isLowStock?: boolean;     // 低庫存
};
