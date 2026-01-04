import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ThemeSelectionState = {
  isOpen: boolean;
  selectedThemeId: number | null;
  userName: string;
  skipAnimation: boolean;
};

// Storage Key
const STORAGE_KEY = 'fufood_theme_selection_flow';

// Load initial state from sessionStorage
const loadState = (): ThemeSelectionState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        isOpen: false,
        selectedThemeId: null,
        userName: '',
        skipAnimation: false,
      };
    }
    const parsed = JSON.parse(raw);
    // If there's saved state, set skipAnimation to true for restoration
    return {
      ...parsed,
      skipAnimation: parsed.isOpen ? true : false,
    };
  } catch (error) {
    console.error('Failed to load theme selection state:', error);
    return {
      isOpen: false,
      selectedThemeId: null,
      userName: '',
      skipAnimation: false,
    };
  }
};

const initialState: ThemeSelectionState = loadState();

const themeSelectionSlice = createSlice({
  name: 'themeSelection',
  initialState,
  reducers: {
    openThemeSelection: (
      state,
      action: PayloadAction<{ selectedThemeId?: number; userName?: string }>
    ) => {
      state.isOpen = true;
      state.selectedThemeId = action.payload.selectedThemeId ?? null;
      state.userName = action.payload.userName ?? '';
      state.skipAnimation = false;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    updateThemeSelection: (
      state,
      action: PayloadAction<{ selectedThemeId?: number; userName?: string }>
    ) => {
      if (action.payload.selectedThemeId !== undefined) {
        state.selectedThemeId = action.payload.selectedThemeId;
      }
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    closeThemeSelection: (state) => {
      state.isOpen = false;
      state.selectedThemeId = null;
      state.userName = '';
      state.skipAnimation = false;
      sessionStorage.removeItem(STORAGE_KEY);
    },
    setSkipAnimation: (state, action: PayloadAction<boolean>) => {
      state.skipAnimation = action.payload;
    },
  },
});

export const {
  openThemeSelection,
  updateThemeSelection,
  closeThemeSelection,
  setSkipAnimation,
} = themeSelectionSlice.actions;

// Selectors
export const selectThemeSelectionIsOpen = (state: { themeSelection: ThemeSelectionState }) =>
  state.themeSelection.isOpen;
export const selectThemeSelectionSelectedId = (state: { themeSelection: ThemeSelectionState }) =>
  state.themeSelection.selectedThemeId;
export const selectThemeSelectionUserName = (state: { themeSelection: ThemeSelectionState }) =>
  state.themeSelection.userName;
export const selectThemeSelectionSkipAnimation = (state: { themeSelection: ThemeSelectionState }) =>
  state.themeSelection.skipAnimation;

export default themeSelectionSlice.reducer;
