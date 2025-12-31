import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Modal 步驟類型
export type GroupModalStep =
  | 'home'
  | 'settings'
  | 'create'
  | 'edit'
  | 'members'
  | 'invite'
  | null;

type GroupModalState = {
  step: GroupModalStep;
  targetGroupId: string | null; // 編輯/成員/邀請時的目標群組 ID
};

// Storage Key
const STORAGE_KEY = 'fufood_group_modal';

// 從 sessionStorage 載入狀態
const loadState = (): GroupModalState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { step: null, targetGroupId: null };
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load group modal state:', error);
    return { step: null, targetGroupId: null };
  }
};

const initialState: GroupModalState = loadState();

const groupModalSlice = createSlice({
  name: 'groupModal',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ step: GroupModalStep; targetGroupId?: string }>,
    ) => {
      state.step = action.payload.step;
      state.targetGroupId = action.payload.targetGroupId || null;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    closeModal: (state) => {
      state.step = null;
      state.targetGroupId = null;
      sessionStorage.removeItem(STORAGE_KEY);
    },
    restoreModal: (state) => {
      const loaded = loadState();
      state.step = loaded.step;
      state.targetGroupId = loaded.targetGroupId;
    },
  },
});

export const { openModal, closeModal, restoreModal } = groupModalSlice.actions;

// Selectors
export const selectModalStep = (state: { groupModal: GroupModalState }) =>
  state.groupModal.step;
export const selectTargetGroupId = (state: { groupModal: GroupModalState }) =>
  state.groupModal.targetGroupId;

export default groupModalSlice.reducer;
