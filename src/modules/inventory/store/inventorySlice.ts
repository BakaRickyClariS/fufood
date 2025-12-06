import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FoodItem, FilterOptions, InventoryStats } from '../types';

type InventoryState = {
  items: FoodItem[];
  selectedItem: FoodItem | null;
  filters: FilterOptions;
  stats: InventoryStats | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  filters: {
    category: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'expiryDate',
    sortOrder: 'asc',
  },
  stats: null,
  isLoading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<FoodItem[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<FoodItem>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<FoodItem>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setSelectedItem: (state, action: PayloadAction<FoodItem | null>) => {
      state.selectedItem = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterOptions>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action: PayloadAction<InventoryStats>) => {
      state.stats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  removeItem,
  setSelectedItem,
  setFilters,
  setStats,
  setLoading,
  setError,
} = inventorySlice.actions;

// Selectors
export const selectAllItems = (state: { inventory: InventoryState }) =>
  state.inventory.items;
export const selectInventoryLoading = (state: { inventory: InventoryState }) =>
  state.inventory.isLoading;
export const selectInventoryError = (state: { inventory: InventoryState }) =>
  state.inventory.error;
export const selectInventoryFilters = (state: { inventory: InventoryState }) =>
  state.inventory.filters;
export const selectInventoryStats = (state: { inventory: InventoryState }) =>
  state.inventory.stats;
export const selectSelectedItem = (state: { inventory: InventoryState }) =>
  state.inventory.selectedItem;

export default inventorySlice.reducer;
