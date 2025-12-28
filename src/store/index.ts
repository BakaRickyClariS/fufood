import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from '@/modules/food-scan/store/cameraSlice';
import inventoryReducer from '@/modules/inventory/store/inventorySlice';
import groupsReducer from '@/modules/groups/store/groupsSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
    inventory: inventoryReducer,
    groups: groupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
