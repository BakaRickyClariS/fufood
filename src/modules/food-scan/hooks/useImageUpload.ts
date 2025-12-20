import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { foodScanApi } from '../services';
import { mediaApi } from '@/modules/media/api/mediaApi';
import type { ScanResult } from '../types';

type UseImageUploadProps = {
  onUploadSuccess?: (blob: Blob) => Promise<void>;
};

export const useImageUpload = (props?: UseImageUploadProps) => {
  const { onUploadSuccess } = props || {};
  
  // 保留細粒度的狀態追蹤，但主要邏輯交給 React Query
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing'>('idle');

  const mutation = useMutation<ScanResult, Error, string>({
    mutationFn: async (img: string) => {
      if (!img) throw new Error('No image provided');

      try {
        setStage('uploading');
        
        // 1. 轉換圖片
        const response = await fetch(img);
        const blob = await response.blob();

        // 2. 上傳至後端
        const optimizedUrl = await mediaApi.uploadImage(blob);

        if (onUploadSuccess) {
          await onUploadSuccess(blob);
        }

        // 3. AI 分析
        setStage('analyzing');
        const result = await foodScanApi.recognizeImage(optimizedUrl);
        
        return result;
      } catch (error) {
        // 確保錯誤時重置狀態 (雖 useMutation 會處理 isError，但 local stage 需重置)
        setStage('idle'); 
        throw error;
      }
    },
    onSettled: () => {
       // 完成後 (成功或失敗) 重置 stage，或者保留在 success 狀態視需求而定
       // 這裡若設為 idle，會導致 UI 在拿到資料後立刻不再顯示 loading
       // 由於 mutation.isPending 會變 false，外部會以此為主
       setStage('idle');
    }
  });

  return {
    // 相容舊介面
    isUploading: mutation.isPending && stage === 'uploading',
    isAnalyzing: mutation.isPending && stage === 'analyzing',
    // 也可以直接暴露 isPending 讓外部決定
    isLoading: mutation.isPending,
    
    uploadImage: mutation.mutateAsync,
    error: mutation.error ? (mutation.error instanceof Error ? mutation.error.message : '發生未知錯誤') : null,
    reset: mutation.reset,
  };
};
