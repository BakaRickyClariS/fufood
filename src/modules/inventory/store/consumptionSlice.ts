import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ConsumptionItem, ConsumptionReason } from '@/modules/recipe/types';

// Extended item type for consumption flow
export type ItemWithReason = ConsumptionItem & {
  selectedReasons?: ConsumptionReason[];
  customReasonStr?: string;
  id?: string;
};

export type ConsumptionStep = 'input' | 'edit' | 'success' | null;

type ConsumptionState = {
  items: ItemWithReason[];
  step: ConsumptionStep;
  contextId: string | null; // e.g., source item ID or recipe ID
};

// Storage Key
const STORAGE_KEY = 'fufood_consumption_flow';

// Load initial state from sessionStorage
const loadState = (): ConsumptionState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        items: [],
        step: null,
        contextId: null,
      };
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load consumption state:', error);
    return {
      items: [],
      step: null,
      contextId: null,
    };
  }
};

const initialState: ConsumptionState = loadState();

const consumptionSlice = createSlice({
  name: 'consumption',
  initialState,
  reducers: {
    startConsumption: (
      state,
      action: PayloadAction<{ items: ItemWithReason[]; contextId?: string }>
    ) => {
      state.items = action.payload.items;
      state.step = 'input';
      state.contextId = action.payload.contextId || null;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    updateConsumptionItems: (state, action: PayloadAction<ItemWithReason[]>) => {
      state.items = action.payload;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    setConsumptionStep: (state, action: PayloadAction<ConsumptionStep>) => {
      state.step = action.payload;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    clearConsumption: (state) => {
      state.items = [];
      state.step = null;
      state.contextId = null;
      sessionStorage.removeItem(STORAGE_KEY);
    },
    restoreConsumption: (state) => {
      const loaded = loadState();
      state.items = loaded.items;
      state.step = loaded.step;
      state.contextId = loaded.contextId;
    },
  },
});

export const {
  startConsumption,
  updateConsumptionItems,
  setConsumptionStep,
  clearConsumption,
  restoreConsumption,
} = consumptionSlice.actions;

// Selectors
export const selectConsumptionItems = (state: { consumption: ConsumptionState }) =>
  state.consumption.items;
export const selectConsumptionStep = (state: { consumption: ConsumptionState }) =>
  state.consumption.step;
export const selectConsumptionContextId = (state: { consumption: ConsumptionState }) =>
  state.consumption.contextId;

export default consumptionSlice.reducer;
