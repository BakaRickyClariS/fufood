import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type RefrigeratorState = {
  activeRefrigeratorId: string | null;
};

const initialState: RefrigeratorState = {
  activeRefrigeratorId: localStorage.getItem('activeRefrigeratorId') || null,
};

const refrigeratorSlice = createSlice({
  name: 'refrigerator',
  initialState,
  reducers: {
    setActiveRefrigeratorId: (state, action: PayloadAction<string>) => {
      state.activeRefrigeratorId = action.payload;
      localStorage.setItem('activeRefrigeratorId', action.payload);
    },
    clearActiveRefrigeratorId: (state) => {
      state.activeRefrigeratorId = null;
      localStorage.removeItem('activeRefrigeratorId');
    },
  },
});

export const { setActiveRefrigeratorId, clearActiveRefrigeratorId } =
  refrigeratorSlice.actions;

export const selectActiveRefrigeratorId = (state: {
  refrigerator: RefrigeratorState;
}) => state.refrigerator.activeRefrigeratorId;

export default refrigeratorSlice.reducer;
