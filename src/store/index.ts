import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from '@/modules/food-scan/store/cameraSlice';
import batchScanReducer from '@/modules/food-scan/store/batchScanSlice';
import inventoryReducer from '@/modules/inventory/store/inventorySlice';
import groupsReducer from '@/modules/groups/store/groupsSlice';
import groupModalReducer from '@/modules/groups/store/groupModalSlice';
import activeGroupReducer from './slices/activeGroupSlice';
import shoppingListReducer from './slices/shoppingListSlice';
import consumptionReducer from '@/modules/inventory/store/consumptionSlice';
import themeSelectionReducer from './slices/themeSelectionSlice';
import recipeReducer from '@/modules/recipe/store/recipeSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
    batchScan: batchScanReducer,
    inventory: inventoryReducer,
    groups: groupsReducer,
    groupModal: groupModalReducer,
    activeGroup: activeGroupReducer,
    shoppingList: shoppingListReducer,
    consumption: consumptionReducer,
    themeSelection: themeSelectionReducer,
    recipe: recipeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
