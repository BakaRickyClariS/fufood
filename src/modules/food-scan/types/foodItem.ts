import type { FoodCategory } from '@/modules/inventory/types/inventory.types'; // Import from inventory

export type FoodAttribute = string;

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
  expiryDate: string; // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes: string;
  imageUrl?: string;
  groupId?: string;
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
  status?: string; // Added for API compatibility
  isExpiringSoon?: boolean; // 即將過期
  isLowStock?: boolean; // 低庫存
};
