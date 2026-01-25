import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { foodScanApi } from '../services';
import type { ScanResult, MultipleScanResult } from '../types';

type UseImageUploadProps = {
  onUploadSuccess?: (blob: Blob) => Promise<void>;
};

export const useImageUpload = (props?: UseImageUploadProps) => {
  const { onUploadSuccess } = props || {};

  // 保留細粒度的狀態追蹤，但主要邏輯交給 React Query
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing'>(
    'idle',
  );

  const mutation = useMutation<ScanResult | MultipleScanResult, Error, string>({
    mutationFn: async (img: string) => {
      if (!img) throw new Error('No image provided');

      try {
        setStage('uploading');

        // 1. 轉換圖片
        const response = await fetch(img);
        const blob = await response.blob();

        // 將 Blob 轉換為 File 物件，以便傳遞給多重辨識 API
        const file = new File([blob], 'captured_image.jpg', {
          type: 'image/jpeg',
        });

        // 2. 上傳至後端 (用於單一辨識，如果是多重辨識，API 會自己處理上傳?)
        // 根據 API 設計：
        // 單一辨識: uploadImage(blob) -> url -> recognizeImage(url)
        // 多重辨識: recognizeMultipleImages(file) -> 內部上傳並辨識

        // 為了相容性與正確流程，我們這裡做一個判斷
        // 但為了簡化遷移，我們可以讓 useImageUpload 支援參數來決定模式
        // 目前我們先保留舊流程，但如果使用 recognizeMultipleImages，則直接傳 file

        // 暫時採用: 總是使用多重辨識 API (因為它也支援單一結果且功能更強)
        // 但要注意 backward compatibility.
        // 為了保險，我們先用新的 API

        setStage('analyzing');
        // New Workflow: Use recognizeMultipleImages directly with File
        const result = await foodScanApi.recognizeMultipleImages(file);

        if (onUploadSuccess) {
          await onUploadSuccess(blob);
        }

        return result;
      } catch (error) {
        // 確保錯誤時重置狀態
        setStage('idle');
        throw error;
      }
    },
    onSettled: () => {
      setStage('idle');
    },
  });

  return {
    isUploading: mutation.isPending && stage === 'uploading',
    isAnalyzing: mutation.isPending && stage === 'analyzing',
    isLoading: mutation.isPending,

    uploadImage: mutation.mutateAsync,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : '發生未知錯誤'
      : null,
    reset: mutation.reset,
    data: mutation.data, // Expose data
  };
};
