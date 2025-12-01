import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CameraStatus = 'idle' | 'capturing' | 'uploading' | 'analyzing' | 'done';

export interface CameraState {
  isCapturing: boolean;
  image: string | null;
  status: CameraStatus;
  triggerToken: number;
}

const initialState: CameraState = {
  isCapturing: true,
  image: null,
  status: 'idle',
  triggerToken: 0,
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    triggerCapture: (state) => {
      state.triggerToken += 1;
    },
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
      state.triggerToken = 0;
    },
  },
});

export const { 
  triggerCapture, 
  setCapturedImage, 
  retake, 
  setUploadStatus,
  resetCamera 
} = cameraSlice.actions;

export default cameraSlice.reducer;
