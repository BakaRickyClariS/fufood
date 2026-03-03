import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ActiveGroupState = {
  activeGroupId: string | null;
};

const initialState: ActiveGroupState = {
  activeGroupId: null,
};

const activeGroupSlice = createSlice({
  name: 'activeGroup',
  initialState,
  reducers: {
    setActiveGroupId: (state, action: PayloadAction<string>) => {
      state.activeGroupId = action.payload;
    },
    clearActiveGroupId: (state) => {
      state.activeGroupId = null;
    },
  },
});

export const { setActiveGroupId, clearActiveGroupId } =
  activeGroupSlice.actions;

export const selectActiveGroupId = (state: {
  activeGroup: ActiveGroupState;
}) => state.activeGroup.activeGroupId;

export default activeGroupSlice.reducer;
