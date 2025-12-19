import { aiApi } from '@/api/client';

/**
 * 媒體上傳 API 回應格式
 */
export type UploadResponse = {
  success: boolean;
  data: {
    /** 上傳後的公開 URL */
    url: string;
    /** Cloudinary Public ID（可選） */
    publicId?: string;
  };
};

/**
 * 媒體 API
 *
 * 所有媒體相關操作使用 AI API 後端
 * Base URL: VITE_AI_API_BASE_URL
 * 端點: /media/upload
 */
export const mediaApi = {
  /**
   * 上傳圖片至後端（轉傳至 Cloudinary）
   *
   * @param file - 要上傳的檔案（支援 File 或 Blob）
   * @returns 上傳後的圖片 URL
   * @throws Error 當上傳失敗或未返回 URL 時
   *
   * @example
   * ```typescript
   * // 上傳 File
   * const url = await mediaApi.uploadImage(fileInput.files[0]);
   *
   * // 上傳 Blob（例如從 canvas 或 fetch 獲取）
   * const blob = await response.blob();
   * const url = await mediaApi.uploadImage(blob);
   * ```
   */
  uploadImage: async (file: File | Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 注意：aiApi 的 base URL 已經是 /api/v1，所以這裡只需要 /media/upload
      const response = await aiApi.post<UploadResponse>('/media/upload', formData);

      if (response.success && response.data?.url) {
        return response.data.url;
      }

      // 處理舊版 API 回應格式（直接返回 { url: string }）
      if ((response as unknown as { url: string }).url) {
        return (response as unknown as { url: string }).url;
      }

      throw new Error('Upload failed: No URL returned');
    } catch (error) {
      console.error('[Media API] Image Upload Error:', error);
      throw error;
    }
  },
};

