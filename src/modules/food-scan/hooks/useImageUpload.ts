import { useState, useCallback } from 'react';
import { cld } from '@/lib/cloudinary';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as qAuto } from '@cloudinary/url-gen/qualifiers/quality';
import { limitFit } from '@cloudinary/url-gen/actions/resize';
import { foodScanApi } from '../services';
import type { ScanResult } from '../types';

type UseImageUploadProps = {
  onUploadSuccess?: (blob: Blob) => Promise<void>;
};

export const useImageUpload = (props?: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (img: string): Promise<ScanResult | null> => {
      if (!img) return null;

      setIsUploading(true);
      setError(null);

      try {
        const response = await fetch(img);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('file', blob);
        formData.append(
          'upload_preset',
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        );

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
          throw new Error('Cloudinary cloud name is not configured');
        }

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error(`上傳失敗: ${uploadResponse.statusText}`);
        }

        const result = await uploadResponse.json();

        const myImage = cld.image(result.public_id);
        myImage
          .delivery(format(auto()))
          .delivery(quality(qAuto()))
          .resize(limitFit().width(500).height(500));

        const optimizedUrl = myImage.toURL();

        if (props?.onUploadSuccess) {
          await props.onUploadSuccess(blob);
        }

        // Start Analysis
        setIsAnalyzing(true);
        setIsUploading(false); // Upload done, analyzing starts

        try {
          const analyzeResult = await foodScanApi.recognizeImage(optimizedUrl);
          return analyzeResult;
        } catch (analyzeError) {
          console.error('API Analyze Error:', analyzeError);
          const errorMessage =
            analyzeError instanceof Error
              ? analyzeError.message
              : '圖片分析失敗，請稍後再試';

          setError(errorMessage);
          // Re-throw error so the caller (CameraCapture) can handle it (e.g. show Toast)
          throw error;
        } finally {
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error('上傳失敗:', err);
        setError('上傳失敗，請檢查網路連線');
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [props?.onUploadSuccess],
  );

  return {
    isUploading,
    isAnalyzing,
    uploadImage,
    error,
  };
};
