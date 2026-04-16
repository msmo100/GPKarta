import { apiClient } from './client';
import type { MarkerImage } from '@gpkarta/shared';

export const imagesApi = {
  upload: (markerId: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return apiClient
      .post<{ data: MarkerImage }>(`/images/marker/${markerId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },

  delete: (imageId: string) => apiClient.delete(`/images/${imageId}`),

  reorder: (imageId: string, order: number) =>
    apiClient.patch(`/images/${imageId}/order`, { order }),
};
