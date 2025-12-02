import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CameraStatus = 'idle' | 'capturing' | 'uploading' | 'analyzing' | 'done';

export interface CameraState {
  isCapturing: boolean;
  image: string | null;
  status: CameraStatus;
}

const initialState: CameraState = {
  isCapturing: true,
  image: null,
  status: 'idle',
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setCapturedImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload;
      state.isCapturing = false;
      state.status = 'idle';
    },
    retake: (state) => {
      state.image = null;
      state.isCapturing = true;
      state.status = 'capturing';
    },
    setUploadStatus: (state, action: PayloadAction<CameraStatus>) => {
      state.status = action.payload;
    },
    resetCamera: (state) => {
      state.isCapturing = true;
      state.image = null;
      state.status = 'idle';
    },
  },
});

export const { 
  setCapturedImage, 
  retake, 
  setUploadStatus,
  resetCamera 
} = cameraSlice.actions;

export default cameraSlice.reducer;
