import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from '@/modules/food-scan/store/cameraSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
