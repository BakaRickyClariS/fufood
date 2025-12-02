import { apiClient } from '@/lib/apiClient';

export const mediaApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Note: apiClient needs to handle FormData correctly. 
    // Current apiClient sets Content-Type to application/json by default.
    // We might need to override it or let browser set it (by passing undefined).
    // For now, let's assume apiClient handles it or we need to modify apiClient.
    // Actually, fetch handles FormData automatically if Content-Type is NOT set.
    return apiClient.post<{ url: string }>('/media/upload', formData, {
      headers: { 'Content-Type': undefined as any } // Hack to let browser set boundary
    });
  },
};
