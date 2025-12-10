export type FoodCategory = string;

export type FoodUnit = string;

export type InventoryStatus =
  | 'normal'
  | 'low-stock'
  | 'expired'
  | 'expiring-soon'
  | 'frequent';

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
