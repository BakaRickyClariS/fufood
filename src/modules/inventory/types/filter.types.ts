import type { FoodCategory, InventoryStatus } from './inventory.types';

export type FilterOptions = {
  category?: FoodCategory | 'all';
  status?: InventoryStatus | 'all' | InventoryStatus[];
  searchQuery?: string;
  sortBy?: 'name' | 'expiryDate' | 'quantity' | 'purchaseDate';
  sortOrder?: 'asc' | 'desc';
  attributes?: string[];
};

export type Tab =
  | 'all'
  | 'expired'
  | 'expiring-soon'
  | 'low-stock'
  | 'common-items';
