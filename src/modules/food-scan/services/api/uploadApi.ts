import { apiClient } from '@/lib/apiClient';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId?: string;
  };
}

export const uploadApi = {
  /**
   * 上傳圖片至後端 (再由後端轉傳至 Cloudinary)
   *Endpoint: POST /api/v1/media/upload
   */
  uploadImage: async (file: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 根據 ai_media_api_spec.md，API 路徑為 /media/upload (Base URL 已在 apiClient 設定)
      // 注意: apiClient 預設會處理 JSON，但對於 FormData 可能需要注意 Content-Type
      // 一般 axios/fetch 遇到 FormData 會自動設定 boundary，不需要手動設 Content-Type
      
      const response = await apiClient.post<UploadResponse>('/media/upload', formData);
      
      if (response.success && response.data?.url) {
        return response.data.url;
      }
      
      throw new Error('Upload failed: No URL returned');
    } catch (error) {
      console.error('Image Upload Error:', error);
      throw error;
    }
  },
};
