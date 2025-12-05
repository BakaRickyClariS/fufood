import type { FoodCategory, InventoryStatus } from './inventory.types';

export type FilterOptions = {
  category?: FoodCategory | 'all';
  status?: InventoryStatus | 'all';
  searchQuery?: string;
  sortBy?: 'name' | 'expiryDate' | 'quantity' | 'purchaseDate';
  sortOrder?: 'asc' | 'desc';
};

export type Tab = 'all' | 'expired' | 'expiring-soon' | 'low-stock' | 'common-items';
