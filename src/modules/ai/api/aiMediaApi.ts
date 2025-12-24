/**
 * AI 媒體 API
 *
 * 提供圖片上傳與影像辨識功能
 */
import { aiApi } from '@/api/client';
import type { MediaUploadResponse, AnalyzeImageResponse } from '../types';

export const aiMediaApi = {
  /**
   * 上傳圖片至 CDN
   * @param file 要上傳的圖片檔案
   * @returns CDN 圖片 URL
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await aiApi.post<MediaUploadResponse>(
      '/media/upload',
      formData,
    );

    if (result.success && result.data?.url) {
      return result.data.url;
    }

    throw new Error('上傳失敗');
  },

  /**
   * AI 食材辨識 - 使用圖片 URL
   * @param imageUrl 已上傳的圖片 URL
   */
  analyzeImageByUrl: (imageUrl: string): Promise<AnalyzeImageResponse> =>
    aiApi.post<AnalyzeImageResponse>('/ai/analyze-image', { imageUrl }),

  /**
   * AI 食材辨識 - 直接上傳檔案
   * @param file 要辨識的圖片檔案
   */
  analyzeImageByFile: async (file: File): Promise<AnalyzeImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return aiApi.post<AnalyzeImageResponse>('/ai/analyze-image', formData);
  },
};
