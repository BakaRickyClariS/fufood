import { aiApi } from '@/api/client';

export const mediaApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return aiApi.post<{ url: string }>('/api/v1/media/upload', formData);
  },
};

