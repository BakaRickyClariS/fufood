import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FoodItem, FilterOptions, InventoryStats } from '../types';
import type { LayoutType } from '../types/layoutTypes';

type InventoryState = {
  items: FoodItem[];
  selectedItem: FoodItem | null;
  filters: FilterOptions;
  stats: InventoryStats | null;
  isLoading: boolean;
  error: string | null;
  currentLayout: LayoutType;
  categoryOrder: string[];
  settings: import('../types').InventorySettings | null;
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
  currentLayout: 'layout-a',
  categoryOrder: [],
  settings: null,
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
    toggleLowStockAlert: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.lowStockAlert = !item.lowStockAlert;
        // Update selected item if it matches
        if (state.selectedItem && state.selectedItem.id === action.payload) {
          state.selectedItem = { ...item };
        }
      }
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
    setLayout: (state, action: PayloadAction<LayoutType>) => {
      state.currentLayout = action.payload;
    },
    setCategoryOrder: (state, action: PayloadAction<string[]>) => {
      state.categoryOrder = action.payload;
    },
    setSettings: (
      state,
      action: PayloadAction<import('../types').InventorySettings>,
    ) => {
      state.settings = action.payload;
      if (action.payload.layoutType) {
        state.currentLayout = action.payload.layoutType;
      }
      if (action.payload.categoryOrder) {
        state.categoryOrder = action.payload.categoryOrder;
      }
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
  setLayout,
  setCategoryOrder,
  setSettings,
  toggleLowStockAlert,
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
export const selectCurrentLayout = (state: { inventory: InventoryState }) => {
  if (!state.inventory) {
    return 'layout-a';
  }
  return state.inventory.currentLayout;
};
export const selectCategoryOrder = (state: { inventory: InventoryState }) =>
  state.inventory.categoryOrder;
export const selectSettings = (state: { inventory: InventoryState }) =>
  state.inventory.settings;

export default inventorySlice.reducer;
