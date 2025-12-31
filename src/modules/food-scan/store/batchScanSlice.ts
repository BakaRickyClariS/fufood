import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FoodItemInput } from '../types';

export type BatchItem = {
  id: string; // 用於 key
  data: FoodItemInput;
  imageUrl: string;
  status: 'pending' | 'submitted';
};

export type BatchScanState = {
  items: BatchItem[];
  currentIndex: number;
};

const initialState: BatchScanState = {
  items: [],
  currentIndex: 0,
};

const batchScanSlice = createSlice({
  name: 'batchScan',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<BatchItem[]>) => {
      state.items = action.payload;
      state.currentIndex = 0;
    },
    markCurrentAsSubmitted: (state) => {
      if (state.items[state.currentIndex]) {
        state.items[state.currentIndex].status = 'submitted';
      }
    },
    goToNext: (state) => {
      if (state.currentIndex < state.items.length - 1) {
        state.currentIndex += 1;
      }
    },
    goToPrev: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    reset: () => initialState,
    removeItem: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      state.items.splice(indexToRemove, 1);
      // Adjust currentIndex if needed
      if (state.currentIndex >= state.items.length && state.items.length > 0) {
        state.currentIndex = state.items.length - 1;
      }
    },
  },
});

export const {
  setItems,
  markCurrentAsSubmitted,
  goToNext,
  goToPrev,
  reset,
  removeItem,
} = batchScanSlice.actions;

export default batchScanSlice.reducer;
