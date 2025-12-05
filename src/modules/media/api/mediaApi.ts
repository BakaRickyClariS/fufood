import { apiClient } from '@/lib/apiClient';

export const mediaApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<{ url: string }>('/media/upload', formData);
  },
};
