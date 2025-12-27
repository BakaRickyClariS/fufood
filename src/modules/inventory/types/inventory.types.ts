export type FoodCategory = string;

export type FoodUnit = string;

export type InventoryStatus =
  | 'normal'
  | 'low-stock'
  | 'expired'
  | 'expiring-soon'
  | 'frequent'
  | 'completed';

export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  imageUrl?: string;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  lowStockAlert: boolean;
  lowStockThreshold: number;
  notes?: string;
  groupId?: string; // 所屬群組
  createdAt: string;
  updatedAt?: string;
  attributes?: string[]; // e.g. ['葉菜類', '有機']
  purchaseCount?: number; // 購買次數(頻率)，用於常買項目排序
  lastPurchaseQuantity?: number; // 上次購買數量，用於顯示
};

export type CategoryInfo = {
  id: string;
  title: string;
  count: number;
  imageUrl: string;
  bgColor: string;
  slogan: string;
  description: string[];
};

export type InventoryStats = {
  totalItems: number;
  expiredCount: number;
  expiringSoonCount: number; // 3 天內到期
  lowStockCount: number;
  byCategory: Record<FoodCategory, number>;
};
