export type FoodCategory =
  | '蔬果類'
  | '冷凍調理類'
  | '主食烘焙類'
  | '乳製品飲料類'
  | '冷凍海鮮類'
  | '肉品類'
  | '其他';

export type FoodUnit =
  | '個'
  | '包'
  | '瓶'
  | '罐'
  | '盒'
  | '顆'
  | '根'
  | '把'
  | '條'
  | '桶'
  | '片'
  | 'kg'
  | 'g'
  | 'L'
  | 'ml';

export type InventoryStatus =
  | 'normal'
  | 'low-stock'
  | 'expired'
  | 'expiring-soon';

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
  expiringSoonCount: number; // 3天內過期
  lowStockCount: number;
  byCategory: Record<FoodCategory, number>;
};
