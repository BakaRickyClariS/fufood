import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from '@/modules/food-scan/store/cameraSlice';
import batchScanReducer from '@/modules/food-scan/store/batchScanSlice';
import inventoryReducer from '@/modules/inventory/store/inventorySlice';
import groupsReducer from '@/modules/groups/store/groupsSlice';
import refrigeratorReducer from './slices/refrigeratorSlice';
import shoppingListReducer from './slices/shoppingListSlice';
import consumptionReducer from '@/modules/inventory/store/consumptionSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
    batchScan: batchScanReducer,
    inventory: inventoryReducer,
    groups: groupsReducer,
    refrigerator: refrigeratorReducer,
    shoppingList: shoppingListReducer,
    consumption: consumptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
